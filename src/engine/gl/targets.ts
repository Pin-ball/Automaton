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
    throw new Error('Unexpected framebuffer attachments')
  }
  return { framebuffer: info.framebuffer, state, layers }
}

export class TargetRing {
  private slots: [Target, Target, Target]

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.slots = [
      createTarget(gl, width, height),
      createTarget(gl, width, height),
      createTarget(gl, width, height),
    ]
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

  all(): readonly Target[] {
    return this.slots
  }

  dispose(gl: WebGL2RenderingContext) {
    for (const target of this.slots) {
      gl.deleteFramebuffer(target.framebuffer)
      gl.deleteTexture(target.state)
      gl.deleteTexture(target.layers)
    }
  }
}
