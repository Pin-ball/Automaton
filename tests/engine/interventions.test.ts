import { presets } from '@src/engine/rules/presets.ts'
import type { Rule } from '@src/engine/rules/rule.ts'
import { ADAPTATION, MAX_PAINT_OPS, PAINT } from '@src/engine/shaders/defines.ts'
import type { PaintOp } from '@src/engine/types.ts'
import { adaptationPasses } from '@src/engine/world/adaptation.ts'
import { paintBatches } from '@src/engine/world/paint.ts'
import { randomSequence } from '@src/engine/world/random.ts'
import { describe, expect, it } from 'vitest'

const DISK_AREA_2 = 13
const DISK_AREA_4 = 49

describe('paintBatches', () => {
  it('splits operations into batches of the shader size', () => {
    const ops = Array.from<unknown, PaintOp>({ length: MAX_PAINT_OPS + 3 }, (_, i) => ({
      x: i,
      y: 0,
      radius: 1,
      kind: 'set',
    }))
    const batches = paintBatches(ops)
    expect(batches.map((batch) => batch.uOpCount)).toEqual([MAX_PAINT_OPS, 3])
  })

  it('encodes kind and density', () => {
    const [batch] = paintBatches([{ x: 1, y: 2, radius: 3, kind: 'erase', density: 0.5 }])
    expect(Array.from(batch?.uOps.slice(0, 4) ?? [])).toEqual([1, 2, 3, PAINT.erase])
    expect(batch?.uDensity[0]).toBe(0.5)
  })

  it.each<[string, PaintOp]>([
    ['a zero radius', { x: 0, y: 0, radius: 0, kind: 'set' }],
    ['a density above 1', { x: 0, y: 0, radius: 1, kind: 'set', density: 2 }],
    ['a center beyond float precision', { x: 2 ** 30, y: 0, radius: 1, kind: 'set' }],
    ['an infinite center', { x: Number.POSITIVE_INFINITY, y: 0, radius: 1, kind: 'add' }],
    ['an inherited kind', JSON.parse('{"x": 0, "y": 0, "radius": 1, "kind": "toString"}')],
  ])('rejects %s', (_, op) => {
    expect(() => paintBatches([op])).toThrow(RangeError)
  })
})

describe('adaptationPasses', () => {
  function recipe(from: Rule, to: Rule): string[] {
    const names = Object.fromEntries(Object.entries(ADAPTATION).map(([name, code]) => [code, name]))
    return adaptationPasses(from, to).map((pass) => names[pass.uKind] ?? '?')
  }

  it.each<[string, Rule, Rule, string[]]>([
    ['Conway to Bosco', presets.conway, presets.bosco, ['thicken']],
    ['Bosco to Conway', presets.bosco, presets.conway, ['thin']],
    ['Bosco to Lenia', presets.bosco, presets.lenia, ['soften']],
    ['Lenia to Bosco', presets.lenia, presets.bosco, ['threshold']],
    ['Conway to Lenia', presets.conway, presets.lenia, ['thicken', 'soften']],
    ['Lenia to Conway', presets.lenia, presets.conway, ['threshold', 'thin']],
    ['a parameter tweak', presets.lenia, { ...presets.lenia, dt: 0.05 }, []],
    ['finite states to continuous', { ...presets.lenia, states: 9 }, presets.lenia, []],
    [
      'a much larger Lenia ring',
      presets.lenia,
      { ...presets.lenia, kernel: { shape: 'ring', radius: 32 } },
      ['threshold', 'thicken', 'soften'],
    ],
  ])('adapts %s', (_, from, to, expected) => {
    expect(recipe(from, to)).toEqual(expected)
  })

  it('thickens in proportion to the new radius', () => {
    const [toBosco] = adaptationPasses(presets.conway, presets.bosco)
    const [toLenia] = adaptationPasses(presets.conway, presets.lenia)
    expect(toBosco?.uReach).toBe(2)
    expect(toLenia?.uReach).toBe(4)
  })

  it('keeps the same fill for a fully alive neighborhood at any reach', () => {
    const fill = (pass: { uAmount: number } | undefined, area: number) =>
      1 - (1 - (pass?.uAmount ?? 0)) ** area
    const [toBosco] = adaptationPasses(presets.conway, presets.bosco)
    const [toLenia] = adaptationPasses(presets.conway, presets.lenia)
    expect(toBosco?.uAmount).toBeCloseTo(0.6, 6)
    expect(fill(toLenia, DISK_AREA_4)).toBeCloseTo(fill(toBosco, DISK_AREA_2), 6)
  })
})

describe('randomSequence', () => {
  it('repeats for the same seed and differs between seeds', () => {
    const a = randomSequence(4)
    const b = randomSequence(4)
    const c = randomSequence(5)
    const first = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(first)
    expect([c(), c(), c()]).not.toEqual(first)
  })
})
