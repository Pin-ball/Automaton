import { EngineContext } from '@src/engine/engineContext.ts'
import type { Surface, WorldOptions } from '@src/engine/types.ts'
import { World } from '@src/engine/world/world.ts'

export type Engine = {
  createWorld(options: WorldOptions): World
  dispose(): void
}

export function createEngine(surface: Surface): Engine {
  const ctx = new EngineContext(surface)

  return {
    createWorld(options) {
      return new World(ctx, options)
    },

    dispose() {
      ctx.dispose()
    },
  }
}
