import type { EngineContext } from '@src/engine/engineContext.ts'
import { EngineError } from '@src/engine/errors.ts'
import { bindProgram } from '@src/engine/gl/program.ts'
import { readAttachmentsAsync } from '@src/engine/gl/readback.ts'
import { TargetRing } from '@src/engine/gl/targets.ts'
import type { Rule } from '@src/engine/rules/rule.ts'
import { validateRule } from '@src/engine/rules/rule.ts'
import type { Cells, Rect, Region, TrailFade, WorldOptions } from '@src/engine/types.ts'
import { RuleResources } from '@src/engine/world/ruleResources.ts'

const DEFAULT_TRAIL_FADE: TrailFade = { first: 0.62, decay: 0.8 }

function checkRect(rect: Rect, width: number, height: number) {
  const { x, y, width: w, height: h } = rect
  const integers = [x, y, w, h].every(Number.isInteger)
  if (!integers || w < 1 || h < 1 || x < 0 || y < 0 || x + w > width || y + h > height) {
    throw new RangeError(`Rect ${x},${y} ${w}×${h} is outside the ${width}×${height} world`)
  }
}

function redChannel(pixels: Float32Array, count: number): Float32Array {
  const out = new Float32Array(count)
  for (let i = 0; i < count; i++) out[i] = pixels[i * 4] ?? 0
  return out
}

function checkTrailFade(fade: TrailFade): TrailFade {
  const valid = [fade.first, fade.decay].every((value) => value >= 0 && value <= 1)
  if (!valid) throw new RangeError('Trail fade values must be within [0, 1]')
  return Object.freeze({ ...fade })
}

export class World {
  readonly width: number
  readonly height: number
  readonly trailFade: TrailFade
  private ctx: EngineContext
  private currentRule: Rule
  private ring: TargetRing
  private resources: RuleResources
  private generationCount = 0
  private disposed = false

  constructor(ctx: EngineContext, options: WorldOptions) {
    ctx.assertUsable()
    const { width, height } = options
    const limit: number = ctx.gl.getParameter(ctx.gl.MAX_TEXTURE_SIZE)
    if (![width, height].every((side) => Number.isInteger(side) && side >= 1 && side <= limit)) {
      throw new RangeError(`World width and height must be integers within 1..${limit}`)
    }
    this.ctx = ctx
    this.width = width
    this.height = height
    this.currentRule = validateRule(options.rule)
    this.trailFade = checkTrailFade(options.trailFade ?? DEFAULT_TRAIL_FADE)
    this.ring = new TargetRing(ctx.gl, width, height)
    try {
      this.resources = new RuleResources(ctx.gl, this.currentRule)
    } catch (error) {
      this.ring.dispose(ctx.gl)
      throw error
    }
    ctx.register(this)
  }

  get rule(): Rule {
    return this.currentRule
  }

  get bounds(): Rect {
    return { x: 0, y: 0, width: this.width, height: this.height }
  }

  get generation(): number {
    return this.generationCount
  }

  setRule(rule: Rule) {
    this.assertUsable()
    this.currentRule = validateRule(rule)
    this.resources.update(this.currentRule)
  }

  step(count = 1) {
    this.assertUsable()
    if (!Number.isInteger(count) || count < 0)
      throw new RangeError('Step count must be a non-negative integer')
    for (let i = 0; i < count; i++) this.stepOnce()
  }

  upload(rect: Rect, cells: Cells) {
    this.assertUsable()
    checkRect(rect, this.width, this.height)
    const size = rect.width * rect.height
    const trail = cells.trail ?? cells.state
    if (cells.state.length !== size || trail.length !== size) {
      throw new RangeError(`Expected ${size} cells for a ${rect.width}×${rect.height} rect`)
    }
    const layers = new Float32Array(size * 4)
    for (let i = 0; i < size; i++) layers[i * 4] = trail[i] ?? 0

    const { gl } = this.ctx
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    for (const target of [this.ring.current, this.ring.previous]) {
      this.writeRect(target.state, rect, gl.RED, cells.state)
      this.writeRect(target.layers, rect, gl.RGBA, layers)
    }
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  async readRegion(rect: Rect = this.bounds): Promise<Region> {
    this.assertUsable()
    checkRect(rect, this.width, this.height)
    const { gl } = this.ctx
    const [state, trail] = await readAttachmentsAsync(
      gl,
      this.ring.current.framebuffer,
      [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1],
      rect,
      () => this.abortReason(),
    )
    if (!state || !trail) throw new EngineError('readback', 'missing attachment')
    const count = rect.width * rect.height
    return {
      width: rect.width,
      height: rect.height,
      state: redChannel(state, count),
      trail: redChannel(trail, count),
    }
  }

  clear() {
    this.assertUsable()
    const { gl } = this.ctx
    for (const target of this.ring.all()) {
      this.ctx.beginPass(target.framebuffer, this.width, this.height)
      gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0])
      gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 0])
    }
    this.ctx.endPass()
    this.generationCount = 0
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.ctx.unregister(this)
    if (this.ctx.lost) return
    this.ring.dispose(this.ctx.gl)
    this.resources.dispose()
  }

  private abortReason(): Error | null {
    if (this.disposed) return new EngineError('disposed', 'world')
    return this.ctx.abortReason()
  }

  private assertUsable() {
    const reason = this.abortReason()
    if (reason) throw reason
  }

  private writeRect(texture: WebGLTexture, rect: Rect, format: number, data: Float32Array) {
    const { gl } = this.ctx
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      format,
      gl.FLOAT,
      data,
    )
  }

  private stepOnce() {
    const { current, work } = this.ring
    this.ctx.beginPass(work.framebuffer, this.width, this.height)
    bindProgram(this.ctx.gl, this.ctx.programs.step, {
      uState: current.state,
      uLayers: current.layers,
      uFadeFirst: this.trailFade.first,
      uFadeDecay: this.trailFade.decay,
      ...this.resources.uniforms(),
    })
    this.ctx.drawFullscreen()
    this.ctx.endPass()
    this.ring.advance()
    this.generationCount++
  }
}
