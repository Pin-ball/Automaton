import type { Edge, Growth } from '@src/engine/rules/rule.ts'
import { MAX_RADIUS } from '@src/engine/rules/rule.ts'
import type { PaintKind } from '@src/engine/types.ts'

export const PACK_WIDTH = 256

export const ALIVE_THRESHOLD = 0.5

export const MAX_PAINT_OPS = 16

export const MAX_ZONES = 8

export const REDUCE_BLOCK = 4

export const GROWTH: Record<Growth['kind'], number> = { counts: 0, bell: 1 }

export const EDGE: Record<Edge, number> = { wrap: 0, wall: 1 }

export const PAINT: Record<PaintKind, number> = { set: 0, erase: 1, add: 2 }

export type AdaptationPass = 'thicken' | 'thin' | 'soften' | 'threshold'

export const ADAPTATION: Record<AdaptationPass, number> = {
  thicken: 0,
  thin: 1,
  soften: 2,
  threshold: 3,
}

export const DEFINES = [
  `#define PACK_WIDTH ${PACK_WIDTH}`,
  `#define MAX_RADIUS ${MAX_RADIUS}`,
  `#define MAX_PAINT_OPS ${MAX_PAINT_OPS}`,
  `#define MAX_ZONES ${MAX_ZONES}`,
  `#define REDUCE_BLOCK ${REDUCE_BLOCK}`,
  `#define ALIVE ${ALIVE_THRESHOLD.toFixed(2)}`,
  `#define GROWTH_COUNTS ${GROWTH.counts}`,
  `#define EDGE_WRAP ${EDGE.wrap}`,
  `#define PAINT_SET ${PAINT.set}`,
  `#define PAINT_ERASE ${PAINT.erase}`,
  `#define PAINT_ADD ${PAINT.add}`,
  `#define ADAPT_THICKEN ${ADAPTATION.thicken}`,
  `#define ADAPT_THIN ${ADAPTATION.thin}`,
  `#define ADAPT_SOFTEN ${ADAPTATION.soften}`,
  `#define ADAPT_THRESHOLD ${ADAPTATION.threshold}`,
  '',
].join('\n')
