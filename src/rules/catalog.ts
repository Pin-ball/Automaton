import type { PaintOp, Rule } from '@src/engine/index.ts'
import { presets } from '@src/engine/index.ts'

export const ruleNames = ['conway', 'bosco', 'lenia'] as const

export type RuleName = (typeof ruleNames)[number]

export type Brush = Pick<PaintOp, 'radius' | 'kind'>

export type Start =
  | { kind: 'soup'; density: number }
  | { kind: 'patches'; size: number; coverage: number }

export type RuleEntry = { rule: Rule; pace: number; brush: Brush; start: Start }

export const rules: Record<RuleName, RuleEntry> = {
  conway: {
    rule: presets.conway,
    pace: 12,
    brush: { radius: 0.5, kind: 'set' },
    start: { kind: 'soup', density: 0.3 },
  },
  bosco: {
    rule: presets.bosco,
    pace: 10,
    brush: { radius: 2.2, kind: 'set' },
    start: { kind: 'soup', density: 0.5 },
  },
  lenia: {
    rule: presets.lenia,
    pace: 30,
    brush: { radius: 3.2, kind: 'add' },
    start: { kind: 'patches', size: 24, coverage: 0.17 },
  },
}
