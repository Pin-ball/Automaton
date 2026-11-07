import type { Engine, World } from '@src/engine/index.ts'
import { createEngine, isEngineError } from '@src/engine/index.ts'
import { gosperGun } from '@src/patterns/conway.ts'
import type { RuleName } from '@src/rules/catalog.ts'
import { rules } from '@src/rules/catalog.ts'
import { reseed as reseedWorld } from '@src/rules/seeds.ts'

export type Snapshot = {
  ruleName: RuleName
  playing: boolean
  speed: number
  generation: number
  error: string | null
}

export const WIDTH = 256
export const HEIGHT = 160

const MAX_STEPS_PER_FRAME = 4
const SNAPSHOT_INTERVAL_MS = 100
const BACKGROUND_COLOR = [6, 8, 12]
const ALIVE_COLOR = [255, 196, 107]
const TRAIL_COLOR = [224, 120, 46]

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function mix(from: number[], to: number[], amount: number): number[] {
  return from.map((value, i) => value + ((to[i] ?? value) - value) * amount)
}

export class Preview {
  private engine: Engine | null = null
  private world: World | null = null
  private display: CanvasRenderingContext2D | null = null
  private image = new ImageData(WIDTH, HEIGHT)
  private snapshot: Snapshot = {
    ruleName: 'conway',
    playing: true,
    speed: rules.conway.pace,
    generation: 0,
    error: null,
  }
  private listeners = new Set<() => void>()
  private frame = 0
  private lastTime = 0
  private lastEmit = 0
  private budget = 0
  private reading = false

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => this.snapshot

  attach(canvas: HTMLCanvasElement) {
    this.display = canvas.getContext('2d')
    try {
      this.engine = createEngine(document.createElement('canvas'))
      this.world = this.engine.createWorld({
        width: WIDTH,
        height: HEIGHT,
        rule: rules[this.snapshot.ruleName].rule,
      })
      this.world.protect({
        rect: {
          x: Math.floor((WIDTH - gosperGun.width) / 2),
          y: Math.floor((HEIGHT - gosperGun.height) / 2),
          width: gosperGun.width,
          height: gosperGun.height,
        },
        state: gosperGun.state,
        rule: gosperGun.rule,
      })
      this.reseed()
      this.frame = requestAnimationFrame(this.tick)
    } catch (error) {
      this.update({ error: describe(error) })
    }
  }

  detach() {
    cancelAnimationFrame(this.frame)
    this.engine?.dispose()
    this.engine = null
    this.world = null
    this.display = null
    this.reading = false
    this.lastTime = 0
    this.budget = 0
  }

  selectRule(ruleName: RuleName) {
    this.withWorld((world) => world.adapt(rules[ruleName].rule))
    this.update({ ruleName, speed: rules[ruleName].pace })
  }

  setSpeed(speed: number) {
    this.update({ speed })
  }

  togglePlay() {
    this.update({ playing: !this.snapshot.playing })
  }

  stepOnce() {
    this.withWorld((world) => world.step())
    this.update({ playing: false })
  }

  clear() {
    this.withWorld((world) => world.clear())
    this.emit()
  }

  reseed() {
    this.withWorld((world) => reseedWorld(world, this.snapshot.ruleName))
    this.emit()
  }

  paint(x: number, y: number) {
    const { brush } = rules[this.snapshot.ruleName]
    this.withWorld((world) => world.paint([{ x: x + 0.5, y: y + 0.5, ...brush }]))
  }

  private tick = (time: number) => {
    this.frame = requestAnimationFrame(this.tick)
    const world = this.world
    if (!world) return

    const elapsed = this.lastTime ? (time - this.lastTime) / 1000 : 0
    this.lastTime = time
    try {
      if (this.snapshot.playing) {
        this.budget = Math.min(this.budget + elapsed * this.snapshot.speed, MAX_STEPS_PER_FRAME)
        const steps = Math.floor(this.budget)
        this.budget -= steps
        world.step(steps)
      }
    } catch (error) {
      cancelAnimationFrame(this.frame)
      this.update({ error: describe(error) })
      return
    }

    if (time - this.lastEmit > SNAPSHOT_INTERVAL_MS) {
      this.lastEmit = time
      this.emit()
    }
    if (!this.reading) void this.draw(world)
  }

  private async draw(world: World) {
    this.reading = true
    try {
      const { state, trail } = await world.readRegion()
      if (world !== this.world) return
      const pixels = this.image.data
      for (let i = 0; i < state.length; i++) {
        const value = state[i] ?? 0
        const glow = (trail[i] ?? 0) * 0.35
        const color =
          value >= glow
            ? mix(BACKGROUND_COLOR, ALIVE_COLOR, value)
            : mix(BACKGROUND_COLOR, TRAIL_COLOR, glow)
        pixels.set([color[0] ?? 0, color[1] ?? 0, color[2] ?? 0, 255], i * 4)
      }
      this.display?.putImageData(this.image, 0, 0)
    } catch (error) {
      if (!isEngineError(error, 'disposed') && !isEngineError(error, 'contextLost')) {
        this.update({ error: describe(error) })
      }
    } finally {
      this.reading = false
    }
  }

  private withWorld(action: (world: World) => void) {
    if (!this.world) return
    try {
      action(this.world)
    } catch (error) {
      this.update({ error: describe(error) })
    }
  }

  private emit() {
    this.update({})
  }

  private update(patch: Partial<Snapshot>) {
    this.snapshot = { ...this.snapshot, generation: this.world?.generation ?? 0, ...patch }
    for (const listener of this.listeners) listener()
  }
}
