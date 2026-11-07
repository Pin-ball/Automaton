import { rectSchema } from '@src/engine/schemas.ts'
import type { Rect } from '@src/engine/types.ts'
import { parseInput } from '@src/engine/validation.ts'

export type Point = { x: number; y: number }

export function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  )
}

export function checkRect(input: Rect, width: number, height: number) {
  const rect = parseInput(rectSchema, input, 'rect')
  if (!contains({ x: 0, y: 0, width, height }, rect)) {
    const { x, y, width: w, height: h } = rect
    throw new RangeError(`Rect ${x},${y} ${w}×${h} is outside the ${width}×${height} world`)
  }
}

export function grow(rect: Rect, by: number): Rect {
  return {
    x: rect.x - by,
    y: rect.y - by,
    width: rect.width + 2 * by,
    height: rect.height + 2 * by,
  }
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}
