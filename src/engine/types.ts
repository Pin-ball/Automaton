import type { Rule } from '@src/engine/rules/rule.ts'

export type { Edge, Growth, Interval, Kernel, Rule } from '@src/engine/rules/rule.ts'

export type Surface = HTMLCanvasElement | OffscreenCanvas

export type Rect = { x: number; y: number; width: number; height: number }

export type TrailFade = { first: number; decay: number }

export type WorldOptions = {
  width: number
  height: number
  rule: Rule
  trailFade?: TrailFade
}

export type Cells = { state: Float32Array; trail?: Float32Array }

export type Region = { width: number; height: number; state: Float32Array; trail: Float32Array }
