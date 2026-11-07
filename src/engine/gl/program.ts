import { EngineError } from '@src/engine/errors.ts'
import type { ProgramInfo } from 'twgl.js'
import { createProgramInfo, setUniforms } from 'twgl.js'

export type Program = ProgramInfo

export function compileProgram(
  gl: WebGL2RenderingContext,
  vertex: string,
  fragment: string,
): Program {
  let failure = ''
  const program = createProgramInfo(gl, [vertex, fragment], (message) => {
    failure = message
  })
  if (!program) throw new EngineError('shader', failure)
  return program
}

export function bindProgram(
  gl: WebGL2RenderingContext,
  program: Program,
  uniforms: Record<string, unknown>,
) {
  gl.useProgram(program.program)
  setUniforms(program, uniforms)
}

export function deleteProgram(gl: WebGL2RenderingContext, program: Program) {
  gl.deleteProgram(program.program)
}
