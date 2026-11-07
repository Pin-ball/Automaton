import type { Rule } from '@src/engine/index.ts'
import type { Grid } from '@src/patterns/rle.ts'
import { parseRle } from '@src/patterns/rle.ts'

export type Pattern = Grid & {
  id: string
  name: string
  rule: Rule
  period?: number
}

type PatternSource = Omit<Pattern, keyof Grid> & { rle: string }

export function definePattern({ rle, ...pattern }: PatternSource): Pattern {
  return Object.freeze({ ...pattern, ...parseRle(rle) })
}
