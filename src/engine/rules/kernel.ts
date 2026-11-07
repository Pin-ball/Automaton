import type { Kernel } from '@src/engine/rules/rule.ts'

type Tap = { dx: number; dy: number; weight: number }

const RING_CUTOFF = 1e-3

function ringWeight(distance: number): number {
  return Math.exp(4 - 1 / (distance * (1 - distance)))
}

function weightAt(kernel: Kernel, dx: number, dy: number): number {
  if (kernel.shape === 'square') return dx !== 0 || dy !== 0 || kernel.center ? 1 : 0
  const distance = Math.hypot(dx, dy) / kernel.radius
  if (distance <= 0 || distance >= 1) return 0
  const weight = ringWeight(distance)
  return weight > RING_CUTOFF ? weight : 0
}

export function kernelTaps(kernel: Kernel, normalize: boolean): Tap[] {
  const { radius } = kernel
  const taps: Tap[] = []
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const weight = weightAt(kernel, dx, dy)
      if (weight > 0) taps.push({ dx, dy, weight })
    }
  }
  if (normalize) {
    const total = taps.reduce((sum, tap) => sum + tap.weight, 0)
    for (const tap of taps) tap.weight /= total
  }
  return taps
}
