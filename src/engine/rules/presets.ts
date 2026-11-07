import type { Rule } from '@src/engine/rules/rule.ts'

export const presets = {
  conway: {
    kernel: { shape: 'square', radius: 1, center: false },
    growth: { kind: 'counts', birth: [[3, 3]], survive: [[2, 3]] },
    dt: 1,
    states: 2,
    edge: 'wrap',
  },
  bosco: {
    kernel: { shape: 'square', radius: 5, center: true },
    growth: { kind: 'counts', birth: [[34, 45]], survive: [[34, 58]] },
    dt: 1,
    states: 2,
    edge: 'wrap',
  },
  lenia: {
    kernel: { shape: 'ring', radius: 10 },
    growth: { kind: 'bell', mu: 0.15, sigma: 0.015 },
    dt: 0.1,
    states: Number.POSITIVE_INFINITY,
    edge: 'wrap',
  },
} as const satisfies Record<string, Rule>
