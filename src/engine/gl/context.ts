import { EngineError } from '@src/engine/errors.ts'
import type { Surface } from '@src/engine/types.ts'

const ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
}

export function createContext(surface: Surface): WebGL2RenderingContext {
  const gl = surface.getContext('webgl2', ATTRIBUTES)
  if (!(gl instanceof WebGL2RenderingContext)) {
    throw new EngineError('unsupported', 'no WebGL 2 context')
  }
  if (gl.isContextLost()) throw new EngineError('contextLost')
  if (!gl.getExtension('EXT_color_buffer_float')) {
    throw new EngineError('unsupported', 'no EXT_color_buffer_float')
  }
  return gl
}
