import type { Engine, Rule } from '@src/engine/index.ts'
import { createEngine, presets } from '@src/engine/index.ts'
import { blinker, block, glider } from '@src/patterns/conway.ts'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  errorCode,
  fill,
  liveCells,
  parseCell,
  place,
  rejectionCode,
  scatter,
  shifted,
  solid,
} from './helpers.ts'

let canvas: HTMLCanvasElement
let engine: Engine

beforeEach(() => {
  canvas = document.createElement('canvas')
  engine = createEngine(canvas)
})

afterEach(() => {
  engine.dispose()
})

function onLeftOrTop(cell: string): boolean {
  const [x, y] = parseCell(cell)
  return x < 4 || y < 4
}

describe('Conway', () => {
  it('moves a glider by (1, 1) every 4 generations', async () => {
    const world = engine.createWorld({ width: 16, height: 16, rule: presets.conway })
    place(world, 2, 2, glider)
    const start = await liveCells(world)
    world.step(4)
    expect(await liveCells(world)).toEqual(shifted(start, 1, 1, 16))
    expect(world.generation).toBe(4)
  })

  it('flips a blinker with a period of 2', async () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    place(world, 2, 3, blinker)
    const start = await liveCells(world)
    world.step()
    expect(await liveCells(world)).not.toEqual(start)
    world.step()
    expect(await liveCells(world)).toEqual(start)
  })

  it('keeps a block still', async () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    place(world, 3, 3, block)
    const start = await liveCells(world)
    world.step(5)
    expect(await liveCells(world)).toEqual(start)
  })
})

describe('edges', () => {
  it('wraps a glider around the torus', async () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    place(world, 5, 5, glider)
    const start = await liveCells(world)
    world.step(32)
    expect(await liveCells(world)).toEqual(start)
  })

  it('stops a glider at a wall', async () => {
    const world = engine.createWorld({
      width: 12,
      height: 12,
      rule: { ...presets.conway, edge: 'wall' },
    })
    place(world, 6, 6, glider)
    for (let i = 0; i < 40; i++) {
      world.step()
      expect((await liveCells(world)).filter(onLeftOrTop)).toEqual([])
    }
    const settled = await liveCells(world)
    world.step(2)
    expect(await liveCells(world)).toEqual(settled)
  })

  it('wraps a neighborhood wider than the world', async () => {
    const rule: Rule = {
      ...presets.conway,
      kernel: { shape: 'square', radius: 3, center: true },
      growth: { kind: 'counts', birth: [], survive: [[49, 49]] },
    }
    const world = engine.createWorld({ width: 4, height: 4, rule })
    fill(world)
    world.step(3)
    expect(await liveCells(world)).toHaveLength(16)
  })
})

describe('large neighborhoods', () => {
  it('handles counts tables wider than the guaranteed texture size', async () => {
    const rule: Rule = {
      ...presets.conway,
      kernel: { shape: 'square', radius: 24, center: true },
      growth: { kind: 'counts', birth: [], survive: [[2401, 2401]] },
    }
    const world = engine.createWorld({ width: 8, height: 8, rule })
    fill(world)
    world.step()
    expect(await liveCells(world)).toHaveLength(64)
  })

  it('lets a Bosco soup live without filling the world', async () => {
    const world = engine.createWorld({ width: 64, height: 64, rule: presets.bosco })
    scatter(world, { size: 24, density: 0.5, seed: 7, binary: true })
    world.step(200)
    const population = (await liveCells(world)).length
    expect(population).toBeGreaterThan(0)
    expect(population).toBeLessThan(64 * 64 * 0.5)
  })
})

describe('continuous rules', () => {
  it('keeps Lenia finite and within [0, 1]', async () => {
    const world = engine.createWorld({ width: 64, height: 64, rule: presets.lenia })
    scatter(world, { size: 30, density: 0.6, seed: 3 })
    world.step(100)
    const { state } = await world.readRegion()
    expect(state.every((value) => Number.isFinite(value) && value >= 0 && value <= 1)).toBe(true)
  })

  it('only produces the allowed states', async () => {
    const world = engine.createWorld({
      width: 64,
      height: 64,
      rule: { ...presets.lenia, states: 9, dt: 0.125 },
    })
    scatter(world, { size: 30, density: 0.6, seed: 5 })
    world.step(40)
    const { state } = await world.readRegion()
    expect(state.every((value) => Math.abs(value * 8 - Math.round(value * 8)) < 1e-6)).toBe(true)
  })

  it('blends counts rules when dt is below 1', async () => {
    const world = engine.createWorld({
      width: 32,
      height: 32,
      rule: { ...presets.conway, dt: 0.5, states: Number.POSITIVE_INFINITY },
    })
    scatter(world, { size: 16, density: 0.4, seed: 9, binary: true })
    world.step(6)
    const { state } = await world.readRegion()
    expect(state.every((value) => value >= 0 && value <= 1)).toBe(true)
    expect(state.some((value) => value > 0 && value < 1)).toBe(true)
  })

  it('changes parameters without losing the state', async () => {
    const world = engine.createWorld({ width: 64, height: 64, rule: presets.lenia })
    scatter(world, { size: 30, density: 0.6, seed: 11 })
    world.step(10)
    const before = await world.readRegion()
    world.setRule({ ...presets.lenia, dt: 0.05, states: 17 })
    world.setRule({ ...presets.lenia, growth: { kind: 'bell', mu: 0.16, sigma: 0.017 } })
    expect((await world.readRegion()).state).toEqual(before.state)
  })

  it('rebuilds the kernel when the radius changes', async () => {
    const wider: Rule = { ...presets.lenia, kernel: { shape: 'ring', radius: 13 } }
    const changed = engine.createWorld({ width: 64, height: 64, rule: presets.lenia })
    scatter(changed, { size: 30, density: 0.6, seed: 13 })
    const start = await changed.readRegion()
    const fresh = engine.createWorld({ width: 64, height: 64, rule: wider })
    fresh.upload(fresh.bounds, start)

    changed.setRule(wider)
    changed.step(10)
    fresh.step(10)
    expect((await changed.readRegion()).state).toEqual((await fresh.readRegion()).state)
  })
})

describe('World', () => {
  it('uploads and reads back a region with its trail', async () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    const state = new Float32Array([1, 0, 0, 1])
    const trail = new Float32Array([1, 0.5, 0.25, 1])
    world.upload({ x: 2, y: 3, width: 2, height: 2 }, { state, trail })
    const region = await world.readRegion({ x: 2, y: 3, width: 2, height: 2 })
    expect(Array.from(region.state)).toEqual([1, 0, 0, 1])
    expect(Array.from(region.trail)).toEqual([1, 0.5, 0.25, 1])
  })

  it('fades the trail of a dead cell', async () => {
    const trailFade = { first: 0.5, decay: 0.25 }
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway, trailFade })
    const cell = { x: 3, y: 3, width: 1, height: 1 }
    place(world, 3, 3, solid(1, 1))
    world.step()
    expect((await world.readRegion(cell)).trail[0]).toBeCloseTo(0.5, 3)
    world.step()
    expect((await world.readRegion(cell)).trail[0]).toBeCloseTo(0.125, 3)
  })

  it('reads the generation it was asked for', async () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    place(world, 2, 3, blinker)
    const pending = world.readRegion()
    world.step()
    const { state } = await pending
    expect(state[3 * 8 + 2]).toBe(1)
    expect(state[2 * 8 + 3]).toBe(0)
  })

  it('clears every cell, its trail and the generation', async () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    place(world, 3, 3, block)
    world.step(3)
    world.clear()
    const { state, trail } = await world.readRegion()
    expect(state.every((value) => value === 0)).toBe(true)
    expect(trail.every((value) => value === 0)).toBe(true)
    expect(world.generation).toBe(0)
  })

  it('keeps its own copy of the rule', () => {
    const rule: Rule = structuredClone(presets.lenia)
    const world = engine.createWorld({ width: 8, height: 8, rule })
    rule.dt = 0.5
    expect(world.rule.dt).toBe(presets.lenia.dt)
    expect(Object.isFrozen(world.rule)).toBe(true)
  })

  it('validates and freezes its trail fade', () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    expect(Object.isFrozen(world.trailFade)).toBe(true)
    const trailFade = { first: 0.5, decay: 2 }
    expect(() =>
      engine.createWorld({ width: 8, height: 8, rule: presets.conway, trailFade }),
    ).toThrow(RangeError)
  })

  it('rejects invalid sizes, rects and rules', () => {
    expect(() => engine.createWorld({ width: 0, height: 8, rule: presets.conway })).toThrow(
      RangeError,
    )
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    const state = new Float32Array(4)
    expect(() => world.upload({ x: 7, y: 7, width: 2, height: 2 }, { state })).toThrow(RangeError)
    expect(() => world.upload({ x: 0, y: 0, width: 3, height: 3 }, { state })).toThrow(RangeError)
    expect(() => world.setRule({ ...presets.lenia, dt: 2 })).toThrow(RangeError)
    expect(() => world.step(1.5)).toThrow(RangeError)
    const numbers = JSON.parse('{"state": [1, 0, 0, 1]}')
    const square = { x: 0, y: 0, width: 2, height: 2 }
    expect(() => world.upload(square, numbers)).toThrow(RangeError)
    const invalid = new Float32Array([1, Number.NaN, 2, 0])
    expect(() => world.upload(square, { state: invalid })).toThrow(RangeError)
  })
})

describe('lifecycle', () => {
  it('refuses to work once disposed', () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    world.dispose()
    expect(errorCode(() => world.step())).toBe('disposed')
  })

  it('rejects a pending read when the world is disposed', async () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    const pending = world.readRegion()
    world.dispose()
    expect(await rejectionCode(pending)).toBe('disposed')
  })

  it('reports a lost context', async () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    const pending = world.readRegion()
    canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext()
    expect(await rejectionCode(pending)).toBe('contextLost')
    expect(errorCode(() => world.step())).toBe('contextLost')
  })

  it('never comes back after a context loss', async () => {
    const world = engine.createWorld({ width: 8, height: 8, rule: presets.conway })
    const control = canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')
    control?.loseContext()
    await new Promise((resolve) => setTimeout(resolve, 50))
    try {
      control?.restoreContext()
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(errorCode(() => world.step())).toBe('contextLost')
  })

  it('refuses a canvas whose engine was disposed', () => {
    engine.dispose()
    expect(errorCode(() => createEngine(canvas))).toBe('contextLost')
  })
})

describe('createEngine', () => {
  it('reports a missing WebGL 2 context', () => {
    const surface = Object.assign(document.createElement('canvas'), { getContext: () => null })
    expect(errorCode(() => createEngine(surface))).toBe('unsupported')
  })

  it('reports missing float render targets', () => {
    const surface = document.createElement('canvas')
    const gl = surface.getContext('webgl2')
    if (!gl) throw new Error('WebGL 2 is required to run this test')
    gl.getExtension = () => null
    expect(errorCode(() => createEngine(surface))).toBe('unsupported')
  })
})
