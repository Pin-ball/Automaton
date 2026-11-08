import type { Engine, PaintOp, Rect, World } from '@src/engine/index.ts'
import { createEngine, presets } from '@src/engine/index.ts'
import { gosperGun } from '@src/patterns/conway.ts'
import { reseed } from '@src/rules/seeds.ts'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { liveCells, parseCell, place, scatter, solid } from './helpers.ts'

const GUN_RECT: Rect = { x: 20, y: 20, width: gosperGun.width, height: gosperGun.height }

const GUN = Array.from(gosperGun.state)

async function stateIn(world: World, rect: Rect): Promise<number[]> {
  return Array.from((await world.readRegion(rect)).state)
}

function outside(cells: readonly string[], rect: Rect): string[] {
  return cells.filter((cell) => {
    const [x, y] = parseCell(cell)
    const inX = x >= rect.x - 1 && x <= rect.x + rect.width
    const inY = y >= rect.y - 1 && y <= rect.y + rect.height
    return !(inX && inY)
  })
}

let engine: Engine

beforeEach(() => {
  engine = createEngine(document.createElement('canvas'))
})

afterEach(() => {
  engine.dispose()
})

describe('paint', () => {
  it('sets every cell whose center lies in the disk', async () => {
    const world = engine.createWorld({ width: 16, height: 16, rule: presets.conway })
    world.paint([{ x: 8, y: 8, radius: 1.5, kind: 'set' }])
    expect(await liveCells(world)).toEqual(['7,7', '7,8', '8,7', '8,8'])
  })

  it('erases cells and their trail', async () => {
    const world = engine.createWorld({ width: 16, height: 16, rule: presets.conway })
    place(world, 6, 6, solid(4, 4))
    world.paint([{ x: 8, y: 8, radius: 3, kind: 'erase' }])
    const { state, trail } = await world.readRegion()
    expect(state.every((value) => value === 0)).toBe(true)
    expect(trail.every((value) => value === 0)).toBe(true)
  })

  it('does not depend on protected zones added before', async () => {
    const op: PaintOp = { x: 70, y: 50, radius: 12, kind: 'set', density: 0.5 }
    const bare = engine.createWorld({ width: 96, height: 72, rule: presets.conway, seed: 3 })
    const zoned = engine.createWorld({ width: 96, height: 72, rule: presets.conway, seed: 3 })
    zoned.protect({ rect: GUN_RECT, state: gosperGun.state, rule: presets.conway })
    for (const world of [bare, zoned]) world.paint([op])
    const area = { x: 55, y: 35, width: 30, height: 30 }
    expect(await stateIn(zoned, area)).toEqual(await stateIn(bare, area))
  })

  it('reaches across a portal edge, not across a wall', async () => {
    const portal = engine.createWorld({ width: 16, height: 16, rule: presets.conway })
    const wall = engine.createWorld({
      width: 16,
      height: 16,
      rule: { ...presets.conway, edge: 'wall' },
    })
    for (const world of [portal, wall]) world.paint([{ x: 0, y: 8, radius: 1.2, kind: 'set' }])
    expect(await liveCells(portal)).toEqual(['0,7', '0,8', '15,7', '15,8'])
    expect(await liveCells(wall)).toEqual(['0,7', '0,8'])
  })

  it('adds matter progressively for continuous rules', async () => {
    const world = engine.createWorld({ width: 16, height: 16, rule: presets.lenia })
    world.paint([{ x: 8, y: 8, radius: 2, kind: 'add' }])
    const { state, trail } = await world.readRegion({ x: 7, y: 7, width: 1, height: 1 })
    expect(state[0]).toBeGreaterThanOrEqual(0.25)
    expect(state[0]).toBeLessThanOrEqual(0.75)
    expect(trail[0]).toBeCloseTo(state[0] ?? -1, 2)
  })

  it('follows the density and repeats with the same seed', async () => {
    const op: PaintOp = { x: 32, y: 32, radius: 20, kind: 'set', density: 0.5 }
    const create = (seed: number) =>
      engine.createWorld({ width: 64, height: 64, rule: presets.conway, seed })
    const [a, b, c] = [create(1), create(1), create(2)]
    for (const world of [a, b, c]) world.paint([op])
    const cells = await liveCells(a)
    const disk = Math.PI * 20 * 20
    expect(cells.length / disk).toBeGreaterThan(0.4)
    expect(cells.length / disk).toBeLessThan(0.6)
    expect(await liveCells(b)).toEqual(cells)
    expect(await liveCells(c)).not.toEqual(cells)
  })

  it('applies more operations than one batch holds', async () => {
    const world = engine.createWorld({ width: 32, height: 32, rule: presets.conway })
    const ops = Array.from<unknown, PaintOp>({ length: 20 }, (_, i) => ({
      x: i + 0.5,
      y: 4.5,
      radius: 0.5,
      kind: 'set',
    }))
    world.paint(ops)
    expect(await liveCells(world)).toHaveLength(20)
  })
})

describe('adapt', () => {
  it('thickens sparse cells for a larger neighborhood', async () => {
    const world = engine.createWorld({ width: 64, height: 64, rule: presets.conway })
    scatter(world, { size: 32, density: 0.1, seed: 3, binary: true })
    const before = (await liveCells(world)).length
    world.adapt(presets.bosco)
    const { state } = await world.readRegion()
    expect(world.rule).toEqual(presets.bosco)
    expect(state.filter((value) => value === 1).length).toBeGreaterThan(before * 2)
    expect(state.every((value) => value === 0 || value === 1)).toBe(true)
  })

  it('thins cells for a smaller neighborhood', async () => {
    const world = engine.createWorld({ width: 64, height: 64, rule: presets.bosco })
    world.paint([{ x: 32, y: 32, radius: 20, kind: 'set' }])
    const before = (await liveCells(world)).length
    world.adapt(presets.conway)
    const ratio = (await liveCells(world)).length / before
    expect(ratio).toBeGreaterThan(0.2)
    expect(ratio).toBeLessThan(0.4)
  })

  it('softens live cells for a continuous rule', async () => {
    const world = engine.createWorld({ width: 32, height: 32, rule: presets.bosco })
    world.paint([{ x: 16, y: 16, radius: 6, kind: 'set' }])
    world.adapt(presets.lenia)
    const { state, trail } = await world.readRegion()
    const live = state.filter((value) => value > 0)
    expect(live.length).toBeGreaterThan(0)
    expect(live.every((value) => value >= 0.3 && value <= 1)).toBe(true)
    expect(trail.every((value, i) => Math.abs(value - (state[i] ?? -1)) < 1e-3)).toBe(true)
  })

  it('never kills a live cell while thickening', async () => {
    const world = engine.createWorld({ width: 32, height: 32, rule: presets.conway })
    place(world, 16, 16, solid(1, 1))
    world.adapt(presets.bosco)
    expect(await liveCells(world)).toContain('16,16')
  })

  it('thresholds continuous cells back to alive or dead', async () => {
    const world = engine.createWorld({ width: 4, height: 1, rule: presets.lenia })
    world.upload(world.bounds, { state: new Float32Array([0.2, 0.34, 0.36, 0.9]) })
    world.adapt(presets.bosco)
    expect(Array.from((await world.readRegion()).state)).toEqual([0, 0, 1, 1])
  })

  it('leaves the cells alone when only parameters change', async () => {
    const world = engine.createWorld({ width: 32, height: 32, rule: presets.lenia })
    scatter(world, { size: 16, density: 0.6, seed: 4 })
    const before = (await world.readRegion()).state
    world.adapt({ ...presets.lenia, dt: 0.05 })
    expect((await world.readRegion()).state).toEqual(before)
  })
})

describe('Gosper gun', () => {
  it('fires a glider every 30 generations', async () => {
    const world = engine.createWorld({ width: 96, height: 72, rule: presets.conway })
    world.upload(GUN_RECT, { state: gosperGun.state })
    const start = (await liveCells(world)).length
    world.step(60)
    expect(await stateIn(world, GUN_RECT)).toEqual(GUN)
    expect((await liveCells(world)).length).toBe(start + 10)
  })
})

describe('protected zones', () => {
  function gunWorld(): World {
    const world = engine.createWorld({ width: 96, height: 72, rule: presets.conway })
    world.protect({ rect: GUN_RECT, state: gosperGun.state, rule: presets.conway })
    return world
  }

  it('shows its content as soon as it is protected', async () => {
    const world = gunWorld()
    expect(await stateIn(world, GUN_RECT)).toEqual(GUN)
  })

  it('lets gliders out into the world', async () => {
    const world = gunWorld()
    world.step(120)
    expect(outside(await liveCells(world), GUN_RECT).length).toBeGreaterThanOrEqual(15)
  })

  it('ignores the brush and adaptations', async () => {
    const world = gunWorld()
    world.paint([{ x: 38, y: 24, radius: 30, kind: 'erase' }])
    world.adapt(presets.bosco)
    world.adapt(presets.conway)
    expect(await stateIn(world, GUN_RECT)).toEqual(GUN)
  })

  it('keeps firing through debris for 3000 generations', async () => {
    const world = gunWorld()
    world.paint([
      { x: 38, y: 24, radius: 25, kind: 'set', density: 0.4 },
      { x: 70, y: 50, radius: 15, kind: 'set', density: 0.5 },
    ])
    world.step(3000)
    expect(await stateIn(world, GUN_RECT)).toEqual(GUN)
  })

  it('sleeps under another rule and comes back intact', async () => {
    const world = gunWorld()
    world.step(7)
    world.adapt(presets.bosco)
    world.step(5)
    world.adapt(presets.lenia)
    world.step(5)
    world.paint([{ x: 38, y: 24, radius: 10, kind: 'add' }])
    world.adapt(presets.bosco)
    world.step(5)
    world.adapt(presets.conway)
    expect(await stateIn(world, GUN_RECT)).toEqual(GUN)
    world.step(30)
    expect(await stateIn(world, GUN_RECT)).toEqual(GUN)
  })

  it('survives a clear and stops protecting once removed', async () => {
    const world = engine.createWorld({ width: 96, height: 72, rule: presets.conway })
    const id = world.protect({ rect: GUN_RECT, state: gosperGun.state, rule: presets.conway })
    world.step(10)
    world.clear()
    expect(await stateIn(world, GUN_RECT)).toEqual(GUN)
    world.unprotect(id)
    world.paint([{ x: 38, y: 24, radius: 30, kind: 'erase' }])
    expect(await liveCells(world)).toEqual([])
  })

  it('sinks what leaves, even with the smallest margin', async () => {
    const world = engine.createWorld({ width: 96, height: 72, rule: presets.conway })
    world.protect({ rect: GUN_RECT, state: gosperGun.state, rule: presets.conway, margin: 4 })
    world.step(600)
    expect(await stateIn(world, GUN_RECT)).toEqual(GUN)
  })

  it('keeps a wide neighborhood away from its sink', () => {
    const world = engine.createWorld({ width: 96, height: 72, rule: presets.bosco })
    const rect = { x: 30, y: 30, width: 10, height: 10 }
    const state = new Float32Array(100).fill(1)
    expect(() => world.protect({ rect, state, rule: presets.bosco, margin: 11 })).toThrow(
      RangeError,
    )
    expect(() => world.protect({ rect, state, rule: presets.bosco, margin: 12 })).not.toThrow()
    const lenia = engine.createWorld({ width: 96, height: 72, rule: presets.lenia })
    expect(() => lenia.protect({ rect, state, rule: presets.lenia })).not.toThrow()
  })

  it('sleeps as soon as the rule changes, even without adapting', async () => {
    const world = gunWorld()
    world.setRule(presets.bosco)
    world.paint([{ x: 38, y: 24, radius: 30, kind: 'erase' }])
    expect(await liveCells(world)).toEqual([])
  })

  it('stays visible right after a reseed', async () => {
    const world = gunWorld()
    reseed(world, 'conway')
    expect(await stateIn(world, GUN_RECT)).toEqual(GUN)
  })

  it('reports a zone too large for the GPU', () => {
    const world = engine.createWorld({ width: 96, height: 72, rule: presets.conway })
    const options = { rect: GUN_RECT, state: gosperGun.state, rule: presets.conway, margin: 20000 }
    expect(() => world.protect(options)).toThrow(/too large/)
  })

  it('holds at most 8 zones', () => {
    const world = engine.createWorld({ width: 64, height: 64, rule: presets.conway })
    const state = new Float32Array(1)
    for (let i = 0; i < 8; i++) {
      world.protect({
        rect: { x: 2 + i * 4, y: 2, width: 1, height: 1 },
        state,
        rule: presets.conway,
      })
    }
    const ninth = { x: 2, y: 20, width: 1, height: 1 }
    expect(() => world.protect({ rect: ninth, state, rule: presets.conway })).toThrow(RangeError)
  })

  it('rejects overlapping zones', () => {
    const world = engine.createWorld({ width: 96, height: 72, rule: presets.conway })
    const rule = presets.conway
    world.protect({ rect: GUN_RECT, state: gosperGun.state, rule })
    const next = { ...GUN_RECT, y: GUN_RECT.y + GUN_RECT.height + 1 }
    expect(() => world.protect({ rect: next, state: gosperGun.state, rule })).toThrow(RangeError)
    const apart = { ...GUN_RECT, y: GUN_RECT.y + GUN_RECT.height + 2 }
    expect(() => world.protect({ rect: apart, state: gosperGun.state, rule })).not.toThrow()
  })

  it('rejects zones at the edge, with a small margin or a wrong cell count', () => {
    const world = engine.createWorld({ width: 96, height: 72, rule: presets.conway })
    const state = gosperGun.state
    const rule = presets.conway
    expect(() => world.protect({ rect: { ...GUN_RECT, x: 0 }, state, rule })).toThrow(RangeError)
    expect(() => world.protect({ rect: GUN_RECT, state, rule, margin: 2 })).toThrow(RangeError)
    expect(() => world.protect({ rect: GUN_RECT, state: new Float32Array(3), rule })).toThrow(
      RangeError,
    )
    const empty = { ...GUN_RECT, width: 0 }
    expect(() => world.protect({ rect: empty, state: new Float32Array(0), rule })).toThrow(
      RangeError,
    )
  })
})
