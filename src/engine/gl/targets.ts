import { EngineError } from '@src/engine/errors.ts'
import { sampling } from '@src/engine/gl/textures.ts'
import { createFramebufferInfo } from 'twgl.js'

export type Target = {
  framebuffer: WebGLFramebuffer
  state: WebGLTexture
  layers: WebGLTexture
}

function createTarget(gl: WebGL2RenderingContext, width: number, height: number): Target {
  const info = createFramebufferInfo(
    gl,
    [
      { internalFormat: gl.R32F, ...sampling(gl) },
      { internalFormat: gl.RGBA16F, ...sampling(gl) },
    ],
    width,
    height,
  )
  gl.bindFramebuffer(gl.FRAMEBUFFER, info.framebuffer)
  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  const [state, layers] = info.attachments
  if (!(state instanceof WebGLTexture) || !(layers instanceof WebGLTexture)) {
    throw new EngineError(gl.isContextLost() ? 'contextLost' : 'unsupported', 'render targets')
  }
  return { framebuffer: info.framebuffer, state, layers }
}

function disposeTargets(gl: WebGL2RenderingContext, targets: readonly Target[]) {
  for (const target of targets) {
    gl.deleteFramebuffer(target.framebuffer)
    gl.deleteTexture(target.state)
    gl.deleteTexture(target.layers)
  }
}

export class TargetRing {
  private slots: [Target, Target, Target]

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    const built: Target[] = []
    try {
      for (let i = 0; i < 3; i++) built.push(createTarget(gl, width, height))
    } catch (error) {
      disposeTargets(gl, built)
      throw error
    }
    const [previous, current, work] = built
    if (!previous || !current || !work) throw new EngineError('unsupported', 'render targets')
    this.slots = [previous, current, work]
  }

  get previous(): Target {
    return this.slots[0]
  }

  get current(): Target {
    return this.slots[1]
  }

  get work(): Target {
    return this.slots[2]
  }

  advance() {
    const [previous, current, work] = this.slots
    this.slots = [current, work, previous]
  }

  swap() {
    const [previous, current, work] = this.slots
    this.slots = [previous, work, current]
  }

  all(): readonly Target[] {
    return this.slots
  }

  dispose(gl: WebGL2RenderingContext) {
    disposeTargets(gl, this.slots)
  }
}

export type SumTarget = {
  framebuffer: WebGLFramebuffer
  texture: WebGLTexture
  width: number
  height: number
}

export function createSumTarget(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
): SumTarget {
  const info = createFramebufferInfo(
    gl,
    [{ internalFormat: gl.RG32F, ...sampling(gl) }],
    width,
    height,
  )
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  const [texture] = info.attachments
  if (!(texture instanceof WebGLTexture)) {
    throw new EngineError(gl.isContextLost() ? 'contextLost' : 'unsupported', 'sum target')
  }
  return { framebuffer: info.framebuffer, texture, width, height }
}

export function disposeSumTarget(gl: WebGL2RenderingContext, target: SumTarget) {
  gl.deleteFramebuffer(target.framebuffer)
  gl.deleteTexture(target.texture)
}
