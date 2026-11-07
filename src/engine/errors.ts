export type EngineErrorCode = 'unsupported' | 'contextLost' | 'disposed' | 'shader' | 'readback'

const MESSAGES: Record<EngineErrorCode, string> = {
  unsupported: 'WebGL 2 with float render targets is not available',
  contextLost: 'The WebGL context was lost',
  disposed: 'This engine resource has been disposed',
  shader: 'Shader compilation failed',
  readback: 'Reading cells back from the GPU failed',
}

export class EngineError extends Error {
  override name = 'EngineError'
  readonly code: EngineErrorCode

  constructor(code: EngineErrorCode, detail?: string) {
    super(detail ? `${MESSAGES[code]}: ${detail}` : MESSAGES[code])
    this.code = code
  }
}

export function isEngineError(error: unknown, code?: EngineErrorCode): error is EngineError {
  return error instanceof EngineError && (code === undefined || error.code === code)
}
