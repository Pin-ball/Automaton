import { ruleSchema } from '@src/engine/rules/rule.ts'
import { z } from 'zod'

const share = z.number().min(0).max(1)

const size = z.number().int().positive()

const cellArray = z.custom<Float32Array>(
  (value) => value instanceof Float32Array && value.every((cell) => cell >= 0 && cell <= 1),
  'Expected a Float32Array of values within [0, 1]',
)

const coordinate = z
  .number()
  .min(-(2 ** 24))
  .max(2 ** 24)

export const rectSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  width: size,
  height: size,
})

export const cellsSchema = z.object({ state: cellArray, trail: cellArray.optional() })

export const stepCountSchema = z.number().int().min(0)

export const worldOptionsSchema = z.object({
  width: size,
  height: size,
  rule: ruleSchema,
  trailFade: z.object({ first: share, decay: share }).default({ first: 0.62, decay: 0.8 }),
  seed: z.number().int().min(0).max(0xffffffff).default(1),
})

export const paintOpSchema = z.object({
  x: coordinate,
  y: coordinate,
  radius: z.number().positive(),
  kind: z.enum(['set', 'erase', 'add']),
  density: share.default(1),
})

export const zoneOptionsSchema = z
  .object({
    rect: rectSchema,
    state: cellArray,
    rule: ruleSchema,
    margin: z.number().int().positive().optional(),
  })
  .refine(({ rect, state }) => state.length === rect.width * rect.height, {
    message: 'A zone needs one cell per position of its rect',
    path: ['state'],
  })
