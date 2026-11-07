import type { Rule } from '@src/engine/rules/rule.ts'
import type { AdaptationPass } from '@src/engine/shaders/defines.ts'
import { ADAPTATION } from '@src/engine/shaders/defines.ts'

type PassUniforms = { uKind: number; uAmount: number; uReach: number }

const SCALE_CHANGE = 2
const THICKEN_CHANCE_AT_REFERENCE = 0.6
const THICKEN_REFERENCE_REACH = 2
const THICKEN_REACH_PER_RADIUS = 0.4
const THIN_KEEP = 0.3
const SOFTEN_FLOOR = 0.3
const THRESHOLD_LEVEL = 0.35

function binary(rule: Rule): boolean {
  return rule.states === 2
}

function diskArea(reach: number): number {
  let area = 0
  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) if (dx * dx + dy * dy <= reach * reach) area++
  }
  return area
}

function thickenChance(reach: number): number {
  const exponent = diskArea(THICKEN_REFERENCE_REACH) / diskArea(reach)
  return 1 - (1 - THICKEN_CHANCE_AT_REFERENCE) ** exponent
}

function pass(kind: AdaptationPass, amount: number, reach = 0): PassUniforms {
  return { uKind: ADAPTATION[kind], uAmount: amount, uReach: reach }
}

export function adaptationPasses(from: Rule, to: Rule): PassUniforms[] {
  const before = from.kernel.radius
  const after = to.kernel.radius
  const grows = after > before * SCALE_CHANGE
  const shrinks = after * SCALE_CHANGE < before
  const threshold = !binary(from) && (binary(to) || grows || shrinks)
  const soften = !binary(to) && (binary(from) || threshold)

  const passes: PassUniforms[] = []
  if (threshold) passes.push(pass('threshold', THRESHOLD_LEVEL))
  if (grows) {
    const reach = Math.max(1, Math.round(after * THICKEN_REACH_PER_RADIUS))
    passes.push(pass('thicken', thickenChance(reach), reach))
  }
  if (shrinks) passes.push(pass('thin', THIN_KEEP))
  if (soften) passes.push(pass('soften', SOFTEN_FLOOR))
  return passes
}
