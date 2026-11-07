import { kernelTaps } from '@src/engine/rules/kernel.ts'
import { presets } from '@src/engine/rules/presets.ts'
import type { Rule } from '@src/engine/rules/rule.ts'
import { neighborCount, sameRule, validateRule } from '@src/engine/rules/rule.ts'
import { countsTable } from '@src/engine/rules/table.ts'
import { describe, expect, it } from 'vitest'

describe('kernelTaps', () => {
  it('gives Conway its 8 neighbors with unit weights', () => {
    const taps = kernelTaps(presets.conway.kernel, false)
    expect(taps).toHaveLength(8)
    expect(taps.every((tap) => tap.weight === 1)).toBe(true)
    expect(taps.some((tap) => tap.dx === 0 && tap.dy === 0)).toBe(false)
  })

  it('includes the center only when asked', () => {
    expect(kernelTaps(presets.bosco.kernel, false)).toHaveLength(121)
    expect(kernelTaps({ ...presets.bosco.kernel, center: false }, false)).toHaveLength(120)
  })

  it('normalizes the weights when asked', () => {
    for (const kernel of [presets.lenia.kernel, presets.bosco.kernel]) {
      const total = kernelTaps(kernel, true).reduce((sum, tap) => sum + tap.weight, 0)
      expect(total).toBeCloseTo(1, 6)
    }
  })

  it('leaves the Lenia ring center empty and stays within its radius', () => {
    const taps = kernelTaps(presets.lenia.kernel, true)
    const { radius } = presets.lenia.kernel
    expect(taps.some((tap) => tap.dx === 0 && tap.dy === 0)).toBe(false)
    expect(taps.every((tap) => Math.hypot(tap.dx, tap.dy) < radius)).toBe(true)
  })
})

describe('countsTable', () => {
  it('encodes B3/S23', () => {
    const table = countsTable(8, [[3, 3]], [[2, 3]])
    expect(Array.from(table.slice(0, 9))).toEqual([0, 0, 0, 1, 0, 0, 0, 0, 0])
    expect(Array.from(table.slice(9))).toEqual([0, 0, 1, 1, 0, 0, 0, 0, 0])
  })
})

describe('neighborCount', () => {
  it('counts the neighbors of a square kernel', () => {
    expect(neighborCount(presets.conway.kernel)).toBe(8)
    expect(neighborCount(presets.bosco.kernel)).toBe(121)
  })
})

describe('validateRule', () => {
  it('accepts every preset', () => {
    for (const rule of Object.values(presets)) expect(() => validateRule(rule)).not.toThrow()
  })

  it('returns a frozen copy', () => {
    const rule: Rule = structuredClone(presets.lenia)
    const valid = validateRule(rule)
    expect(valid).not.toBe(rule)
    expect(Object.isFrozen(valid.growth)).toBe(true)
  })

  it.each<[string, Rule]>([
    ['radius 0', { ...presets.conway, kernel: { shape: 'square', radius: 0, center: false } }],
    ['radius above the limit', { ...presets.lenia, kernel: { shape: 'ring', radius: 33 } }],
    ['an empty ring', { ...presets.lenia, kernel: { shape: 'ring', radius: 1 } }],
    ['dt of 0', { ...presets.lenia, dt: 0 }],
    ['fractional states', { ...presets.lenia, states: 2.5 }],
    ['a single state', { ...presets.lenia, states: 1 }],
    ['non-positive sigma', { ...presets.lenia, growth: { kind: 'bell', mu: 0.15, sigma: 0 } }],
    ['counts on a ring', { ...presets.conway, kernel: { shape: 'ring', radius: 5 } }],
    [
      'birth beyond the neighborhood',
      { ...presets.conway, growth: { kind: 'counts', birth: [[3, 9]], survive: [[2, 3]] } },
    ],
    ['an unknown edge', JSON.parse(JSON.stringify({ ...presets.conway, edge: 'mirror' }))],
    [
      'an unknown growth',
      JSON.parse(JSON.stringify({ ...presets.conway, growth: { kind: 'linear' } })),
    ],
  ])('rejects %s', (_, rule) => {
    expect(() => validateRule(rule)).toThrow(RangeError)
  })
})

describe('sameRule', () => {
  it('compares rules by value, including infinite states', () => {
    expect(sameRule(presets.lenia, structuredClone(presets.lenia))).toBe(true)
    expect(sameRule(presets.conway, { ...presets.conway, edge: 'wall' })).toBe(false)
  })
})
