import type { World } from '@src/engine/index.ts'
import type { RuleName, Start } from '@src/rules/catalog.ts'
import { rules } from '@src/rules/catalog.ts'

export function startCells(
  start: Start,
  width: number,
  height: number,
  random: () => number = Math.random,
): Float32Array {
  const state = new Float32Array(width * height)
  if (start.kind === 'soup') {
    for (let i = 0; i < state.length; i++) state[i] = random() < start.density ? 1 : 0
    return state
  }
  const size = Math.min(start.size, width, height)
  const count = Math.max(1, Math.round((start.coverage * width * height) / (size * size)))
  for (let patch = 0; patch < count; patch++) {
    const left = Math.floor(random() * (width - size + 1))
    const top = Math.floor(random() * (height - size + 1))
    for (let y = top; y < top + size; y++) {
      for (let x = left; x < left + size; x++) state[y * width + x] = random()
    }
  }
  return state
}

export function reseed(world: World, name: RuleName) {
  world.clear({ state: startCells(rules[name].start, world.width, world.height) })
}
