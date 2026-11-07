# Engine

GPU simulation of finite cellular automata, from exact Conway to Lenia, with one configurable rule.
WebGL 2 with float render targets is required. No React, no internal loop: the caller drives every step.

## Usage

```ts
import { createEngine, presets } from '@src/engine/index.ts'

const engine = createEngine(canvas)
const world = engine.createWorld({ width: 768, height: 480, rule: presets.conway })

world.upload({ x: 10, y: 10, width: 3, height: 1 }, { state: new Float32Array([1, 1, 1]) })
world.step(4)
const { state, trail } = await world.readRegion({ x: 0, y: 0, width: 32, height: 32 })

world.dispose()
engine.dispose()
```

## Rule

Every rule computes `next = clamp(a + dt · g(u, a))`, where `u` is the weighted sum of the neighborhood.

| Field    | Values                                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kernel` | `{ shape: 'square', radius, center }` (unit weights) or `{ shape: 'ring', radius }` (Lenia ring). Radius 1 to 32.                                              |
| `growth` | `{ kind: 'counts', birth, survive }`: intervals of live neighbors, needs a square kernel. `{ kind: 'bell', mu, sigma }`: Lenia growth, on a normalized kernel. |
| `dt`     | `1` replaces the state; below `1`, `dt ×` growth is added to it.                                                                                               |
| `states` | How many values a cell can take: `2` alive or dead, `n` evenly spaced values from 0 to 1, `Infinity` continuous.                                               |
| `edge`   | `'wrap'`: a portal, what leaves one side comes back on the other. `'wall'`: nothing exists beyond the border.                                                  |

Presets: `conway` (B3/S23), `bosco` (Larger than Life R5), `lenia` (ring R10).
`setRule` applies any valid rule without touching the state; a new kernel rebuilds its taps. The world keeps a frozen copy of the rule.
Counts read neighbors as alive when `≥ 0.5`, so Conway stays exact.

## World

| Member                                            | Purpose                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `width`, `height`, `bounds`, `rule`, `generation` | Read-only state.                                                                                                              |
| `setRule(rule)`                                   | Hot rule change. Throws `RangeError` on an invalid rule.                                                                      |
| `step(n = 1)`                                     | Advance `n` generations.                                                                                                      |
| `upload(rect, { state, trail? })`                 | Write cells, row-major, `trail` defaults to `state`. Also sets the previous generation, so nothing animates from stale cells. |
| `readRegion(rect?)`                               | Asynchronous read (PBO + fence) of the generation current at call time, whole world by default.                               |
| `clear()`                                         | Empty every cell and reset the generation.                                                                                    |
| `dispose()`                                       | Free the GPU resources.                                                                                                       |

The trail is a visual layer, never part of the rule: `1` while alive, then `first` and ×`decay` per step when a cell has 2 states; equal to the state otherwise. Set it with `createWorld({ trailFade: { first, decay } })`.

Cells are row-major: index `y × width + x`, with `y = 0` as the first row of the world. Which way it faces on screen is the renderer's choice.

## Errors

Engine failures throw or reject with one class, `EngineError`, whose `code` tells what happened. `isEngineError(error, code?)` narrows it. The message is technical English for the console; the UI picks its own translated text from the code.

| `code`        | When                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| `unsupported` | No WebGL 2, or no float render targets.                                                                       |
| `contextLost` | The context was lost, or the surface already served a disposed engine. Create a new engine on a fresh canvas. |
| `disposed`    | The world or engine was disposed.                                                                             |
| `shader`      | A shader failed to compile.                                                                                   |
| `readback`    | Reading cells back from the GPU failed.                                                                       |

Pending reads reject with `contextLost`, `disposed` or `readback`. Invalid input (rule, size, rect) throws a standard `RangeError`.

## Internals

- `state` (R32F) is what kernels read; `layers` (RGBA16F) holds the trail, other channels are reserved. Both are written in one pass.
- Three targets rotate (previous, current, work) so the renderer can blend two generations.
- Kernel taps (`dx`, `dy`, `weight`) and counts tables are packed 256 entries per row, so large radii stay within the guaranteed texture size.
- Every pass resets framebuffer, viewport, scissor and blending.
