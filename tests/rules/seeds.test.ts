import { ruleNames, rules } from '@src/rules/catalog.ts'
import { startCells } from '@src/rules/seeds.ts'
import { describe, expect, it } from 'vitest'
import { unitRandom } from '../engine/helpers.ts'

describe('startCells', () => {
  it('fills a soup at the asked density', () => {
    const state = startCells({ kind: 'soup', density: 0.3 }, 100, 100, unitRandom(7))
    const alive = state.filter((value) => value === 1).length / state.length
    expect(alive).toBeGreaterThan(0.27)
    expect(alive).toBeLessThan(0.33)
    expect(state.every((value) => value === 0 || value === 1)).toBe(true)
  })

  it('scatters continuous patches over the asked share of the world', () => {
    const state = startCells({ kind: 'patches', size: 10, coverage: 0.2 }, 100, 100, unitRandom(3))
    const touched = state.filter((value) => value > 0).length / state.length
    expect(touched).toBeGreaterThan(0.1)
    expect(touched).toBeLessThanOrEqual(0.2)
    expect(state.every((value) => value >= 0 && value < 1)).toBe(true)
  })

  it('fits patches larger than the world', () => {
    const state = startCells({ kind: 'patches', size: 40, coverage: 1 }, 8, 6, unitRandom(5))
    expect(state.filter((value) => value > 0)).toHaveLength(36)
  })

  it('repeats with the same random source', () => {
    for (const name of ruleNames) {
      const { start } = rules[name]
      expect(startCells(start, 32, 24, unitRandom(9))).toEqual(
        startCells(start, 32, 24, unitRandom(9)),
      )
    }
  })
})
