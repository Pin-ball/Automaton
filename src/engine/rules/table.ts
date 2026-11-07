import type { Interval } from '@src/engine/rules/rule.ts'

function within(count: number, intervals: readonly Interval[]): boolean {
  return intervals.some(([min, max]) => count >= min && count <= max)
}

export function countsTable(
  maxCount: number,
  birth: readonly Interval[],
  survive: readonly Interval[],
): Float32Array {
  const width = maxCount + 1
  const table = new Float32Array(width * 2)
  for (let count = 0; count <= maxCount; count++) {
    table[count] = within(count, birth) ? 1 : 0
    table[width + count] = within(count, survive) ? 1 : 0
  }
  return table
}
