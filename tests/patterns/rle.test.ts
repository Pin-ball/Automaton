import { gosperGun } from '@src/patterns/conway.ts'
import { parseRle } from '@src/patterns/rle.ts'
import { describe, expect, it } from 'vitest'

function rows({ width, height, state }: ReturnType<typeof parseRle>): string[] {
  return Array.from({ length: height }, (_, y) =>
    Array.from(state.slice(y * width, (y + 1) * width), (value) => (value ? 'O' : '.')).join(''),
  )
}

describe('parseRle', () => {
  it('reads runs, line ends and comments', () => {
    const grid = parseRle(`
      #N Glider
      #C A comment
      x = 3, y = 3, rule = B3/S23
      bo$2bo$3o!
    `)
    expect(rows(grid)).toEqual(['.O.', '..O', 'OOO'])
  })

  it('skips several rows with a counted line end', () => {
    expect(rows(parseRle('x = 2, y = 3\no2$bo!'))).toEqual(['O.', '..', '.O'])
  })

  it('rejects a missing header, unknown tags and overflowing cells', () => {
    expect(() => parseRle('bo$2bo!')).toThrow(SyntaxError)
    expect(() => parseRle(['x = 3, y = 1', 'bxo!'].join('\n'))).toThrow(SyntaxError)
    expect(() => parseRle('x = 2, y = 1\n3o!')).toThrow(RangeError)
  })
})

describe('Conway bestiary', () => {
  it('draws the Gosper glider gun', () => {
    expect(rows(gosperGun)).toEqual([
      '........................O...........',
      '......................O.O...........',
      '............OO......OO............OO',
      '...........O...O....OO............OO',
      'OO........O.....O...OO..............',
      'OO........O...O.OO....O.O...........',
      '..........O.....O.......O...........',
      '...........O...O....................',
      '............OO......................',
    ])
    expect(gosperGun.period).toBe(30)
  })
})
