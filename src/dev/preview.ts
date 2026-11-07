import type { Engine, World } from '@src/engine/index.ts'
import { createEngine, isEngineError, presets } from '@src/engine/index.ts'

export type PresetName = keyof typeof presets

export type Snapshot = {
  preset: PresetName
  playing: boolean
  speed: number
  generation: number
  error: string | null
}

export const WIDTH = 256
export const HEIGHT = 160

const SPEED: Record<PresetName, number> = { conway: 12, bosco: 10, lenia: 30 }
const BRUSH: Record<PresetName, number> = { conway: 0, bosco: 2, lenia: 3 }
const MAX_STEPS_PER_FRAME = 4
const SNAPSHOT_INTERVAL_MS = 100
const BACKGROUND = [6, 8, 12]
const ALIVE = [255, 196, 107]
const TRAIL = [224, 120, 46]

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
    preset: 'conway',
    playing: true,
    speed: SPEED.conway,
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
        rule: presets[this.snapshot.preset],
      })
      this.randomize()
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

  setPreset(preset: PresetName) {
    this.world?.setRule(presets[preset])
    this.update({ preset, speed: SPEED[preset] })
  }

  setSpeed(speed: number) {
    this.update({ speed })
  }

  togglePlay() {
    this.update({ playing: !this.snapshot.playing })
  }

  stepOnce() {
    this.world?.step()
    this.update({ playing: false })
  }

  clear() {
    this.world?.clear()
    this.emit()
  }

  randomize() {
    const world = this.world
    if (!world) return
    world.clear()
    const state = new Float32Array(WIDTH * HEIGHT)
    if (this.snapshot.preset === 'lenia') {
      for (let patch = 0; patch < 12; patch++) {
        const x0 = Math.floor(Math.random() * (WIDTH - 24))
        const y0 = Math.floor(Math.random() * (HEIGHT - 24))
        for (let y = 0; y < 24; y++) {
          for (let x = 0; x < 24; x++) state[(y0 + y) * WIDTH + x0 + x] = Math.random()
        }
      }
    } else {
      const density = this.snapshot.preset === 'bosco' ? 0.5 : 0.3
      for (let i = 0; i < state.length; i++) state[i] = Math.random() < density ? 1 : 0
    }
    world.upload(world.bounds, { state })
    this.emit()
  }

  paint(x: number, y: number) {
    const world = this.world
    if (!world) return
    const radius = BRUSH[this.snapshot.preset]
    const left = Math.max(0, x - radius)
    const top = Math.max(0, y - radius)
    const width = Math.min(WIDTH, x + radius + 1) - left
    const height = Math.min(HEIGHT, y + radius + 1) - top
    if (width < 1 || height < 1) return
    world.upload(
      { x: left, y: top, width, height },
      { state: new Float32Array(width * height).fill(1) },
    )
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
        const color = value >= glow ? mix(BACKGROUND, ALIVE, value) : mix(BACKGROUND, TRAIL, glow)
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

  private emit() {
    this.update({})
  }

  private update(patch: Partial<Snapshot>) {
    this.snapshot = { ...this.snapshot, generation: this.world?.generation ?? 0, ...patch }
    for (const listener of this.listeners) listener()
  }
}
