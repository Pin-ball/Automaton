import type { EngineErrorCode, World } from '@src/engine/index.ts'
import { isEngineError } from '@src/engine/index.ts'
import { ALIVE_THRESHOLD } from '@src/engine/shaders/defines.ts'

type ScatterOptions = { size: number; density: number; seed: number; binary?: boolean }

function seededRandom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value + 0x6d2b79f5) >>> 0
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function place(world: World, x: number, y: number, rows: readonly string[]) {
  const width = Math.max(...rows.map((row) => row.length))
  const state = new Float32Array(width * rows.length)
  rows.forEach((row, dy) => {
    for (const [dx, char] of [...row].entries()) if (char === 'O') state[dy * width + dx] = 1
  })
  world.upload({ x, y, width, height: rows.length }, { state })
}

export function fill(world: World) {
  const state = new Float32Array(world.width * world.height).fill(1)
  world.upload(world.bounds, { state })
}

export function scatter(world: World, { size, density, seed, binary = false }: ScatterOptions) {
  const next = seededRandom(seed)
  const state = new Float32Array(size * size).map(() => {
    if (next() >= density) return 0
    return binary ? 1 : next()
  })
  const x = Math.floor((world.width - size) / 2)
  const y = Math.floor((world.height - size) / 2)
  world.upload({ x, y, width: size, height: size }, { state })
}

export async function liveCells(world: World): Promise<string[]> {
  const { state, width } = await world.readRegion()
  const cells: string[] = []
  state.forEach((value, i) => {
    if (value >= ALIVE_THRESHOLD) cells.push(`${i % width},${Math.floor(i / width)}`)
  })
  return cells.sort()
}

export function shifted(cells: readonly string[], dx: number, dy: number, size: number): string[] {
  return cells
    .map((cell) => {
      const [x, y] = parseCell(cell)
      return `${(x + dx + size) % size},${(y + dy + size) % size}`
    })
    .sort()
}

export function parseCell(cell: string): [x: number, y: number] {
  const [x = 0, y = 0] = cell.split(',').map(Number)
  return [x, y]
}

export async function rejectionCode(pending: Promise<unknown>): Promise<EngineErrorCode | null> {
  try {
    await pending
  } catch (error) {
    if (isEngineError(error)) return error.code
    throw error
  }
  return null
}

export function errorCode(action: () => unknown): EngineErrorCode | null {
  try {
    action()
  } catch (error) {
    if (isEngineError(error)) return error.code
    throw error
  }
  return null
}
