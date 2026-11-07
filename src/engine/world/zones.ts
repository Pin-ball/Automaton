import type { Rule } from '@src/engine/rules/rule.ts'
import { sameRule } from '@src/engine/rules/rule.ts'
import { zoneOptionsSchema } from '@src/engine/schemas.ts'
import { MAX_ZONES } from '@src/engine/shaders/defines.ts'
import type { Rect, WorldOptions, ZoneOptions } from '@src/engine/types.ts'
import { parseInput } from '@src/engine/validation.ts'
import type { Point } from '@src/engine/world/rect.ts'
import { contains, grow, overlaps } from '@src/engine/world/rect.ts'
import type { World } from '@src/engine/world/world.ts'

type ZoneHost = {
  width: number
  height: number
  createWorld(options: WorldOptions): World
  copyIn(source: World, origin: Point, to: Rect, alsoPrevious: boolean): void
  sink(world: World, band: number): void
}

type Zone = {
  rect: Rect
  rule: Rule
  margin: number
  initial: Float32Array
  world: World
  active: boolean
}

const DEFAULT_MARGIN = 13

function sinkBand(rule: Rule): number {
  return rule.kernel.radius + 1
}

function minimumMargin(rule: Rule): number {
  return sinkBand(rule) + rule.kernel.radius + 1
}

function footprint(rect: Rect): Rect {
  return grow(rect, 1)
}

export class ZoneSet {
  private host: ZoneHost
  private zones = new Map<number, Zone>()
  private nextId = 1

  constructor(host: ZoneHost) {
    this.host = host
  }

  add(options: ZoneOptions, worldRule: Rule): number {
    if (this.zones.size >= MAX_ZONES) {
      throw new RangeError(`A world holds at most ${MAX_ZONES} zones`)
    }
    const { rect, state, rule, margin: requested } = parseInput(zoneOptionsSchema, options, 'zone')
    const minimum = minimumMargin(rule)
    const margin = requested ?? Math.max(DEFAULT_MARGIN, minimum)
    const worldBounds = { x: 0, y: 0, width: this.host.width, height: this.host.height }
    if (!contains(worldBounds, footprint(rect))) {
      throw new RangeError('A zone must stay at least one cell away from the world edges')
    }
    if (margin < minimum) {
      throw new RangeError(`Zone margin must be at least ${minimum}`)
    }
    for (const other of this.zones.values()) {
      if (overlaps(footprint(other.rect), footprint(rect))) {
        throw new RangeError('Zones must not overlap, including the ring of cells around them')
      }
    }

    const world = this.createPrivateWorld(rect, margin, rule)
    const zone: Zone = { rect, rule, margin, initial: state.slice(), world, active: false }
    const id = this.nextId++
    this.zones.set(id, zone)
    this.setActive(zone, sameRule(rule, worldRule))
    return id
  }

  remove(id: number) {
    const zone = this.zones.get(id)
    if (!zone) return
    zone.world.dispose()
    this.zones.delete(id)
  }

  sync(worldRule: Rule) {
    for (const zone of this.zones.values()) this.setActive(zone, sameRule(zone.rule, worldRule))
  }

  restartActive() {
    for (const zone of this.zones.values()) if (zone.active) this.restart(zone)
  }

  afterStep() {
    for (const zone of this.zones.values()) {
      if (!zone.active) continue
      zone.world.step()
      this.host.sink(zone.world, sinkBand(zone.rule))
      this.copy(zone)
    }
  }

  lockedBoxes(): { uLocked: Float32Array; uLockedCount: number } {
    const uLocked = new Float32Array(MAX_ZONES * 4)
    let count = 0
    for (const zone of this.zones.values()) {
      if (!zone.active) continue
      const { x, y, width, height } = footprint(zone.rect)
      uLocked.set([x, y, x + width, y + height], count * 4)
      count++
    }
    return { uLocked, uLockedCount: count }
  }

  dispose() {
    for (const zone of this.zones.values()) zone.world.dispose()
    this.zones.clear()
  }

  private createPrivateWorld(rect: Rect, margin: number, rule: Rule): World {
    try {
      return this.host.createWorld({
        width: rect.width + 2 * margin,
        height: rect.height + 2 * margin,
        rule: { ...rule, edge: 'wall' },
      })
    } catch (error) {
      if (!(error instanceof RangeError)) throw error
      throw new RangeError('This zone and its margin are too large for the GPU')
    }
  }

  private setActive(zone: Zone, active: boolean) {
    if (active && !zone.active) this.restart(zone)
    zone.active = active
  }

  private restart(zone: Zone) {
    const { world, margin, rect, initial } = zone
    world.clear()
    world.upload(
      { x: margin, y: margin, width: rect.width, height: rect.height },
      { state: initial },
    )
    this.copy(zone, true)
  }

  private copy(zone: Zone, alsoPrevious = false) {
    const origin = { x: zone.rect.x - zone.margin, y: zone.rect.y - zone.margin }
    this.host.copyIn(zone.world, origin, footprint(zone.rect), alsoPrevious)
  }
}
