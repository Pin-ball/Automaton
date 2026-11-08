import type {
  cellsSchema,
  paintOpSchema,
  rectSchema,
  worldOptionsSchema,
  zoneOptionsSchema,
} from '@src/engine/schemas.ts'
import type { z } from 'zod'

export type { Edge, Growth, Interval, Kernel, Rule } from '@src/engine/rules/rule.ts'

export type Surface = HTMLCanvasElement | OffscreenCanvas

export type Rect = z.input<typeof rectSchema>

export type WorldOptions = z.input<typeof worldOptionsSchema>

export type TrailFade = z.output<typeof worldOptionsSchema>['trailFade']

export type Cells = z.input<typeof cellsSchema>

export type PaintOp = z.input<typeof paintOpSchema>

export type PaintKind = PaintOp['kind']

export type ZoneOptions = z.input<typeof zoneOptionsSchema>

export type Stats = { population: number; mass: number; generation: number }

export type Region = { width: number; height: number; state: Float32Array; trail: Float32Array }
