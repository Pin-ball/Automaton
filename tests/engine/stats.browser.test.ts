import type { Engine } from '@src/engine/index.ts'
import { createEngine, presets } from '@src/engine/index.ts'
import { glider } from '@src/patterns/conway.ts'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fill, place, rejectionCode } from './helpers.ts'

let canvas: HTMLCanvasElement
let engine: Engine

beforeEach(() => {
  canvas = document.createElement('canvas')
  engine = createEngine(canvas)
})

afterEach(() => {
  engine.dispose()
})

function context(): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2')
  if (!gl) throw new Error('WebGL 2 is missing')
  return gl
}

describe('stats', () => {
  it('counts a glider as five live cells', async () => {
    const world = engine.createWorld({ width: 32, height: 32, rule: presets.conway })
    place(world, 4, 4, glider)
    expect(await world.stats()).toEqual({ population: 5, mass: 5, generation: 0 })
    world.step(8)
    expect(await world.stats()).toEqual({ population: 5, mass: 5, generation: 8 })
  })

  it('sums continuous values as mass', async () => {
    const world = engine.createWorld({ width: 4, height: 2, rule: presets.lenia })
    const state = new Float32Array([0.25, 0.5, 0.75, 1, 0, 0.1, 0.2, 0.3])
    world.upload(world.bounds, { state })
    const { population, mass } = await world.stats()
    expect(mass).toBeCloseTo(3.1, 5)
    expect(population).toBe(state.filter((value) => value >= 0.5).length)
  })

  it('covers sizes that are not multiples of the block', async () => {
    const world = engine.createWorld({ width: 67, height: 13, rule: presets.conway })
    fill(world)
    expect((await world.stats()).population).toBe(67 * 13)
  })

  it('shares one read between overlapping requests', async () => {
    const world = engine.createWorld({ width: 16, height: 16, rule: presets.conway })
    const first = world.stats()
    world.step()
    expect(world.stats()).toBe(first)
    expect((await first).generation).toBe(0)
    const next = world.stats()
    expect(next).not.toBe(first)
    expect((await next).generation).toBe(1)
  })

  it('rejects a pending request when the world is disposed', async () => {
    const world = engine.createWorld({ width: 16, height: 16, rule: presets.conway })
    const pending = world.stats()
    world.dispose()
    expect(await rejectionCode(pending)).toBe('disposed')
  })

  it('rejects instead of throwing once the world is disposed', async () => {
    const world = engine.createWorld({ width: 16, height: 16, rule: presets.conway })
    world.dispose()
    expect(await rejectionCode(world.stats())).toBe('disposed')
    expect(await rejectionCode(world.stats())).toBe('disposed')
  })
})

describe('stepTime', () => {
  it('reports a duration when the GPU timer exists, otherwise null', async () => {
    const world = engine.createWorld({ width: 16, height: 16, rule: presets.conway })
    world.step(3)
    await world.stats()
    if (context().getExtension('EXT_disjoint_timer_query_webgl2')) {
      expect(world.stepTime).toBeGreaterThanOrEqual(0)
    } else {
      expect(world.stepTime).toBeNull()
    }
  })

  it('times a world whose protected zones step inside it', () => {
    const gl = context()
    const world = engine.createWorld({ width: 64, height: 64, rule: presets.conway })
    world.protect({
      rect: { x: 30, y: 30, width: 3, height: 1 },
      state: new Float32Array([1, 1, 1]),
      rule: presets.conway,
    })
    gl.getError()
    world.step(3)
    expect(gl.getError()).toBe(gl.NO_ERROR)
  })
})
