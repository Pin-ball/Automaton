import { parseInput } from '@src/engine/validation.ts'
import { dequal } from 'dequal/lite'
import { z } from 'zod'

export const MAX_RADIUS = 32

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) deepFreeze(child)
    Object.freeze(value)
  }
  return value
}

const radius = z.number().int().min(1).max(MAX_RADIUS)

const kernelSchema = z.discriminatedUnion('shape', [
  z.object({ shape: z.literal('square'), radius, center: z.boolean() }),
  z.object({ shape: z.literal('ring'), radius: radius.min(2) }),
])

const intervalSchema = z
  .tuple([z.number().int().min(0), z.number().int().min(0)])
  .readonly()
  .refine(([min, max]) => min <= max, 'An interval must not end before it starts')

const growthSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('counts'),
    birth: z.array(intervalSchema).readonly(),
    survive: z.array(intervalSchema).readonly(),
  }),
  z.object({ kind: z.literal('bell'), mu: z.number(), sigma: z.number().positive() }),
])

const edgeSchema = z.enum(['wrap', 'wall'])

export const ruleSchema = z
  .object({
    kernel: kernelSchema,
    growth: growthSchema,
    dt: z.number().gt(0).lte(1),
    states: z.union([z.number().int().min(2), z.literal(Number.POSITIVE_INFINITY)]),
    edge: edgeSchema,
  })
  .superRefine(({ kernel, growth }, context) => {
    if (growth.kind !== 'counts') return
    if (kernel.shape !== 'square') {
      context.addIssue({ code: 'custom', message: 'Counts need a square kernel', path: ['growth'] })
      return
    }
    const limit = neighborCount(kernel)
    const outside = [...growth.birth, ...growth.survive].some(([, max]) => max > limit)
    if (outside) {
      context.addIssue({
        code: 'custom',
        message: `Counts must stay within 0..${limit}`,
        path: ['growth'],
      })
    }
  })
  .transform(deepFreeze)

export type Rule = z.infer<typeof ruleSchema>

export type Kernel = Rule['kernel']

type SquareKernel = Extract<Kernel, { shape: 'square' }>

export type Growth = Rule['growth']

export type Interval = z.infer<typeof intervalSchema>

export type Edge = z.infer<typeof edgeSchema>

export function sameRule(a: Rule, b: Rule): boolean {
  return dequal(a, b)
}

export function neighborCount(kernel: SquareKernel): number {
  const side = 2 * kernel.radius + 1
  return side * side - (kernel.center ? 0 : 1)
}

export function validateRule(rule: Rule): Rule {
  return parseInput(ruleSchema, rule, 'rule')
}
