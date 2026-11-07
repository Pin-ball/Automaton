import type { Edge, Growth } from '@src/engine/rules/rule.ts'
import { MAX_RADIUS } from '@src/engine/rules/rule.ts'

export const PACK_WIDTH = 256

export const ALIVE_THRESHOLD = 0.5

export const GROWTH: Record<Growth['kind'], number> = { counts: 0, bell: 1 }

export const EDGE: Record<Edge, number> = { wrap: 0, wall: 1 }

export const DEFINES = [
  `#define PACK_WIDTH ${PACK_WIDTH}`,
  `#define MAX_RADIUS ${MAX_RADIUS}`,
  `#define ALIVE ${ALIVE_THRESHOLD.toFixed(2)}`,
  `#define GROWTH_COUNTS ${GROWTH.counts}`,
  `#define EDGE_WRAP ${EDGE.wrap}`,
  '',
].join('\n')
