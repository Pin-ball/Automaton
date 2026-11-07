import { paintOpSchema } from '@src/engine/schemas.ts'
import { MAX_PAINT_OPS, PAINT } from '@src/engine/shaders/defines.ts'
import type { PaintOp } from '@src/engine/types.ts'
import { parseInput } from '@src/engine/validation.ts'
import { z } from 'zod'

type PaintBatch = { uOps: Float32Array; uDensity: Float32Array; uOpCount: number }

const opsSchema = z.array(paintOpSchema).readonly()

export function paintBatches(input: readonly PaintOp[]): PaintBatch[] {
  const ops = parseInput(opsSchema, input, 'paint operations')
  const batches: PaintBatch[] = []
  for (let start = 0; start < ops.length; start += MAX_PAINT_OPS) {
    const chunk = ops.slice(start, start + MAX_PAINT_OPS)
    const uOps = new Float32Array(MAX_PAINT_OPS * 4)
    const uDensity = new Float32Array(MAX_PAINT_OPS)
    for (const [i, op] of chunk.entries()) {
      uOps.set([op.x, op.y, op.radius, PAINT[op.kind]], i * 4)
      uDensity[i] = op.density
    }
    batches.push({ uOps, uDensity, uOpCount: chunk.length })
  }
  return batches
}
