import type { EngineContext } from '@src/engine/engineContext.ts'
import { EngineError } from '@src/engine/errors.ts'
import { bindProgram } from '@src/engine/gl/program.ts'
import { readAttachmentsAsync } from '@src/engine/gl/readback.ts'
import type { SumTarget } from '@src/engine/gl/targets.ts'
import { createSumTarget, disposeSumTarget } from '@src/engine/gl/targets.ts'
import { REDUCE_BLOCK } from '@src/engine/shaders/defines.ts'

export class Reduction {
  private ctx: EngineContext
  private levels: SumTarget[] = []
  private output: SumTarget

  constructor(ctx: EngineContext, width: number, height: number) {
    this.ctx = ctx
    try {
      let level = this.addLevel(width, height)
      while (level.width > 1 || level.height > 1) level = this.addLevel(level.width, level.height)
      this.output = level
    } catch (error) {
      this.dispose()
      throw error
    }
  }

  async sum(state: WebGLTexture, abortReason: () => Error | null): Promise<Float32Array> {
    const { gl } = this.ctx
    let source = state
    for (const level of this.levels) {
      this.ctx.beginPass(level.framebuffer, level.width, level.height)
      bindProgram(gl, this.ctx.programs.reduce, { uSource: source, uFromState: source === state })
      this.ctx.drawFullscreen()
      source = level.texture
    }
    this.ctx.endPass()
    const [sums] = await readAttachmentsAsync(
      gl,
      this.output.framebuffer,
      [gl.COLOR_ATTACHMENT0],
      { x: 0, y: 0, width: 1, height: 1 },
      abortReason,
    )
    if (!sums) throw new EngineError('readback', 'missing attachment')
    return sums
  }

  dispose() {
    for (const level of this.levels) disposeSumTarget(this.ctx.gl, level)
    this.levels = []
  }

  private addLevel(width: number, height: number): SumTarget {
    const level = createSumTarget(
      this.ctx.gl,
      Math.ceil(width / REDUCE_BLOCK),
      Math.ceil(height / REDUCE_BLOCK),
    )
    this.levels.push(level)
    return level
  }
}
