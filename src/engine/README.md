# Engine

GPU simulation of finite cellular automata, from exact Conway to Lenia, with one configurable rule.
Needs WebGL 2 with float render targets. No React and no internal loop: the caller drives every step.

## Usage

```ts
import { createEngine, presets } from '@src/engine/index.ts'

const engine = createEngine(canvas)
const world = engine.createWorld({ width: 768, height: 480, rule: presets.conway })

world.paint([{ x: 12, y: 10, radius: 3, kind: 'set' }])
world.step(4)
const { state, trail } = await world.readRegion()

engine.dispose()
```

## Rule

`next = clamp(a + dt · g(u, a))`, where `u` is the weighted sum of the neighborhood.

| Field    | Values                                                                                      |
| -------- | ------------------------------------------------------------------------------------------- |
| `kernel` | `square` (radius, center) or `ring` (Lenia). Radius 1 to 32, ring from 2.                   |
| `growth` | `counts` (birth and survive intervals, square kernel only) or `bell` (Lenia `mu`, `sigma`). |
| `dt`     | `1` replaces the state, below `1` blends toward it.                                         |
| `states` | `2` alive or dead, `n` steps from 0 to 1, `Infinity` continuous.                            |
| `edge`   | `wrap` (portal) or `wall` (nothing beyond).                                                 |

Presets: `conway`, `bosco` (Larger than Life), `lenia`.

## World

| Member                                    | Purpose                                                  |
| ----------------------------------------- | -------------------------------------------------------- |
| `setRule(rule)`                           | Changes the rule, keeps the cells.                       |
| `adapt(rule)`                             | Changes the rule and prepares the cells for it, once.    |
| `step(n = 1)`                             | Advances `n` generations.                                |
| `paint(ops)`                              | Brush: `set` (with `density`), `erase` or `add`.         |
| `protect({ rect, state, rule, margin? })` | Protected zone: nothing gets in, everything can get out. |
| `unprotect(id)`                           | Removes a protected zone.                                |
| `upload(rect, cells)`                     | Writes cells, row-major.                                 |
| `readRegion(rect?)`                       | Reads cells asynchronously, without blocking the GPU.    |
| `stats()`                                 | Population, mass and generation, one read at a time.     |
| `stepTime`                                | GPU time of a recent step in ms, `null` if unknown.      |
| `clear(start?)`, `dispose()`              | Empties the world (or resets it to `start`), frees it.   |

A protected zone runs in its own private world and only while the world's rule is its rule; otherwise it sleeps and restarts intact when the rule comes back.

The trail is visual only. `createWorld({ seed })` makes the brush and adaptations repeatable.

## Errors

Failures throw or reject an `EngineError` with a `code`: `unsupported`, `contextLost`, `disposed`, `shader` or `readback`. Invalid input throws a `RangeError`.
