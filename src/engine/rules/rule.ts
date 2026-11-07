const EDGES = ['wrap', 'wall'] as const

export type Edge = (typeof EDGES)[number]

export type SquareKernel = { shape: 'square'; radius: number; center: boolean }

export type RingKernel = { shape: 'ring'; radius: number }

export type Kernel = SquareKernel | RingKernel

export type Interval = readonly [min: number, max: number]

export type Growth =
  | { kind: 'counts'; birth: readonly Interval[]; survive: readonly Interval[] }
  | { kind: 'bell'; mu: number; sigma: number }

export type Rule = {
  kernel: Kernel
  growth: Growth
  dt: number
  states: number
  edge: Edge
}

export const MAX_RADIUS = 32

function fail(message: string): never {
  throw new RangeError(`Invalid rule: ${message}`)
}

function checkInterval([min, max]: Interval, limit: number, label: string) {
  if (!Number.isInteger(min) || !Number.isInteger(max)) fail(`${label} bounds must be integers`)
  if (min < 0 || max < min || max > limit) fail(`${label} must stay within 0..${limit}`)
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) deepFreeze(child)
    Object.freeze(value)
  }
  return value
}

export function neighborCount(kernel: SquareKernel): number {
  const side = 2 * kernel.radius + 1
  return side * side - (kernel.center ? 0 : 1)
}

export function validateRule(rule: Rule): Rule {
  const { kernel, growth, dt, states, edge } = rule
  if (kernel.shape !== 'square' && kernel.shape !== 'ring') fail('unknown kernel shape')
  if (!Number.isInteger(kernel.radius) || kernel.radius < 1 || kernel.radius > MAX_RADIUS) {
    fail(`radius must be an integer within 1..${MAX_RADIUS}`)
  }
  if (kernel.shape === 'ring' && kernel.radius < 2) fail('a ring needs a radius of at least 2')
  if (kernel.shape === 'square' && typeof kernel.center !== 'boolean') {
    fail('center must be a boolean')
  }
  if (!EDGES.some((known) => known === edge)) fail('unknown edge')
  if (!(dt > 0 && dt <= 1)) fail('dt must be within ]0, 1]')
  if (states !== Number.POSITIVE_INFINITY && !(Number.isInteger(states) && states >= 2)) {
    fail('states must be an integer of at least 2, or Infinity')
  }

  if (growth.kind === 'counts') {
    if (kernel.shape !== 'square') fail('counts growth needs a square kernel')
    const limit = neighborCount(kernel)
    for (const interval of growth.birth) checkInterval(interval, limit, 'birth')
    for (const interval of growth.survive) checkInterval(interval, limit, 'survive')
  } else if (growth.kind === 'bell') {
    if (!(growth.sigma > 0)) fail('sigma must be positive')
    if (!Number.isFinite(growth.mu)) fail('mu must be finite')
  } else {
    fail('unknown growth')
  }
  return deepFreeze(structuredClone(rule))
}
