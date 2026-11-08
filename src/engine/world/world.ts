import type { EngineContext } from '@src/engine/engineContext.ts'
import { EngineError } from '@src/engine/errors.ts'
import type { Program } from '@src/engine/gl/program.ts'
import { bindProgram } from '@src/engine/gl/program.ts'
import { readAttachmentsAsync } from '@src/engine/gl/readback.ts'
import { TargetRing } from '@src/engine/gl/targets.ts'
import { GpuTimer } from '@src/engine/gl/timer.ts'
import type { Rule } from '@src/engine/rules/rule.ts'
import { validateRule } from '@src/engine/rules/rule.ts'
import { cellsSchema, stepCountSchema, worldOptionsSchema } from '@src/engine/schemas.ts'
import { EDGE } from '@src/engine/shaders/defines.ts'
import type {
  Cells,
  PaintOp,
  Rect,
  Region,
  Stats,
  TrailFade,
  WorldOptions,
  ZoneOptions,
} from '@src/engine/types.ts'
import { parseInput } from '@src/engine/validation.ts'
import { adaptationPasses } from '@src/engine/world/adaptation.ts'
import { paintBatches } from '@src/engine/world/paint.ts'
import { randomSequence } from '@src/engine/world/random.ts'
import type { Point } from '@src/engine/world/rect.ts'
import { checkRect } from '@src/engine/world/rect.ts'
import { Reduction } from '@src/engine/world/reduction.ts'
import { RuleResources } from '@src/engine/world/ruleResources.ts'
import { ZoneSet } from '@src/engine/world/zones.ts'

function redChannel(pixels: Float32Array, count: number): Float32Array {
  const out = new Float32Array(count)
  for (let i = 0; i < count; i++) out[i] = pixels[i * 4] ?? 0
  return out
}

export class World {
  readonly width: number
  readonly height: number
  readonly trailFade: TrailFade
  private ctx: EngineContext
  private currentRule: Rule
  private ring: TargetRing
  private resources: RuleResources
  private zones: ZoneSet
  private timer: GpuTimer | null
  private reduction: Reduction | null = null
  private pendingStats: Promise<Stats> | null = null
  private nextRandom: () => number
  private generationCount = 0
  private disposed = false

  constructor(ctx: EngineContext, options: WorldOptions, timed = true) {
    ctx.assertUsable()
    const { width, height, rule, trailFade, seed } = parseInput(
      worldOptionsSchema,
      options,
      'world options',
    )
    const limit: number = ctx.gl.getParameter(ctx.gl.MAX_TEXTURE_SIZE)
    if (width > limit || height > limit) {
      throw new RangeError(`World width and height must not exceed ${limit}`)
    }
    this.ctx = ctx
    this.width = width
    this.height = height
    this.currentRule = rule
    this.trailFade = Object.freeze(trailFade)
    this.nextRandom = randomSequence(seed)
    this.ring = new TargetRing(ctx.gl, width, height)
    try {
      this.resources = new RuleResources(ctx.gl, this.currentRule)
    } catch (error) {
      this.ring.dispose(ctx.gl)
      throw error
    }
    this.zones = new ZoneSet({
      width,
      height,
      createWorld: (zoneOptions) =>
        new World(ctx, { ...zoneOptions, trailFade: this.trailFade }, false),
      copyIn: (source, origin, to, alsoPrevious) => this.copyIn(source, origin, to, alsoPrevious),
      sink: (world, band) => world.clearBorder(band),
    })
    this.timer = timed ? new GpuTimer(ctx.gl) : null
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

  get stepTime(): number | null {
    return this.timer?.milliseconds ?? null
  }

  setRule(rule: Rule) {
    this.assertUsable()
    this.currentRule = validateRule(rule)
    this.resources.update(this.currentRule)
    this.zones.sync(this.currentRule)
  }

  step(count = 1) {
    this.assertUsable()
    const steps = parseInput(stepCountSchema, count, 'step count')
    for (let i = 0; i < steps; i++) {
      this.timer?.begin()
      try {
        this.stepOnce()
        this.zones.afterStep()
      } finally {
        this.timer?.end()
      }
    }
  }

  paint(ops: readonly PaintOp[]) {
    this.assertUsable()
    for (const batch of paintBatches(ops)) {
      this.transform(this.ctx.programs.paint, { ...batch, uSeed: this.nextRandom() })
    }
  }

  adapt(rule: Rule) {
    this.assertUsable()
    const before = this.currentRule
    this.setRule(rule)
    for (const pass of adaptationPasses(before, this.currentRule)) {
      this.transform(this.ctx.programs.adapt, { ...pass, uSeed: this.nextRandom() })
    }
  }

  protect(options: ZoneOptions): number {
    this.assertUsable()
    return this.zones.add(options, this.currentRule)
  }

  unprotect(id: number) {
    this.assertUsable()
    this.zones.remove(id)
  }

  upload(rect: Rect, input: Cells) {
    this.assertUsable()
    checkRect(rect, this.width, this.height)
    const cells = parseInput(cellsSchema, input, 'cells')
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

  stats(): Promise<Stats> {
    this.pendingStats ??= this.readStats().finally(() => {
      this.pendingStats = null
    })
    return this.pendingStats
  }

  clear(start?: Cells) {
    this.assertUsable()
    const { gl } = this.ctx
    for (const target of this.ring.all()) {
      this.ctx.beginPass(target.framebuffer, this.width, this.height)
      gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0])
      gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 0])
    }
    this.ctx.endPass()
    this.generationCount = 0
    if (start) this.upload(this.bounds, start)
    this.zones.restartActive()
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.ctx.unregister(this)
    this.zones.dispose()
    if (this.ctx.lost) return
    this.ring.dispose(this.ctx.gl)
    this.resources.dispose()
    this.reduction?.dispose()
    this.timer?.dispose()
  }

  private async readStats(): Promise<Stats> {
    this.assertUsable()
    const generation = this.generationCount
    this.reduction ??= new Reduction(this.ctx, this.width, this.height)
    const sums = await this.reduction.sum(this.ring.current.state, () => this.abortReason())
    return { population: Math.round(sums[0] ?? 0), mass: sums[1] ?? 0, generation }
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

  private transform(program: Program, uniforms: Record<string, unknown>) {
    const { current, work } = this.ring
    this.ctx.beginPass(work.framebuffer, this.width, this.height)
    bindProgram(this.ctx.gl, program, {
      uState: current.state,
      uLayers: current.layers,
      uEdge: EDGE[this.currentRule.edge],
      ...this.zones.lockedBoxes(),
      ...uniforms,
    })
    this.ctx.drawFullscreen()
    this.ctx.endPass()
    this.ring.swap()
  }

  private copyIn(source: World, origin: Point, to: Rect, alsoPrevious: boolean) {
    const targets = alsoPrevious ? [this.ring.current, this.ring.previous] : [this.ring.current]
    const { gl } = this.ctx
    for (const target of targets) {
      this.ctx.beginPass(target.framebuffer, this.width, this.height)
      gl.enable(gl.SCISSOR_TEST)
      gl.scissor(to.x, to.y, to.width, to.height)
      bindProgram(gl, this.ctx.programs.copy, {
        uState: source.ring.current.state,
        uLayers: source.ring.current.layers,
        uOffset: [origin.x, origin.y],
      })
      this.ctx.drawFullscreen()
      gl.disable(gl.SCISSOR_TEST)
    }
    this.ctx.endPass()
  }

  private clearBorder(band: number) {
    const { gl } = this.ctx
    const { width, height } = this
    this.ctx.beginPass(this.ring.current.framebuffer, width, height)
    gl.enable(gl.SCISSOR_TEST)
    for (const [x, y, w, h] of [
      [0, 0, width, band],
      [0, height - band, width, band],
      [0, 0, band, height],
      [width - band, 0, band, height],
    ] as const) {
      gl.scissor(x, y, w, h)
      gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0])
      gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 0])
    }
    gl.disable(gl.SCISSOR_TEST)
    this.ctx.endPass()
  }
}
