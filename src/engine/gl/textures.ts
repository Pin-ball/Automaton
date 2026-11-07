import { PACK_WIDTH } from '@src/engine/shaders/defines.ts'
import { createTexture } from 'twgl.js'

export function sampling(gl: WebGL2RenderingContext) {
  return { minMag: gl.NEAREST, wrap: gl.CLAMP_TO_EDGE }
}

export function createPackedTexture(
  gl: WebGL2RenderingContext,
  internalFormat: number,
  channels: number,
  values: Float32Array,
): WebGLTexture {
  const count = Math.max(1, values.length / channels)
  const height = Math.ceil(count / PACK_WIDTH)
  const src = new Float32Array(PACK_WIDTH * height * channels)
  src.set(values)
  return createTexture(gl, { internalFormat, width: PACK_WIDTH, height, src, ...sampling(gl) })
}
