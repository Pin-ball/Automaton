import type { Rule } from '@src/engine/index.ts'
import { createEngine, presets } from '@src/engine/index.ts'
import type { RuleName } from '@src/rules/catalog.ts'
import { reseed } from '@src/rules/seeds.ts'

type Scenario = { name: string; rule: Rule; start: RuleName }

export type BenchResult = {
  name: string
  wallTime: number
  stepTime: number | null
  population: number
}

export const BENCH_WIDTH = 768
export const BENCH_HEIGHT = 480
export const BUDGET_MS = 8

const WARMUP_STEPS = 10
const MEASURED_STEPS = 60

export const scenarios: Scenario[] = [
  { name: 'Conway', rule: presets.conway, start: 'conway' },
  { name: 'Bosco R5', rule: presets.bosco, start: 'bosco' },
  { name: 'Lenia R10', rule: presets.lenia, start: 'lenia' },
  {
    name: 'Lenia R13',
    rule: { ...presets.lenia, kernel: { shape: 'ring', radius: 13 } },
    start: 'lenia',
  },
]

export function milliseconds(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(2)} ms`
}

async function runScenario({ name, rule, start }: Scenario): Promise<BenchResult> {
  const engine = createEngine(document.createElement('canvas'))
  try {
    const world = engine.createWorld({ width: BENCH_WIDTH, height: BENCH_HEIGHT, rule })
    reseed(world, start)
    world.step(WARMUP_STEPS)
    await world.stats()
    const begin = performance.now()
    world.step(MEASURED_STEPS)
    const { population } = await world.stats()
    const wallTime = (performance.now() - begin) / MEASURED_STEPS
    return { name, wallTime, stepTime: world.stepTime, population }
  } finally {
    engine.dispose()
  }
}

export async function runBench(onResult: (result: BenchResult) => void) {
  for (const scenario of scenarios) onResult(await runScenario(scenario))
}
