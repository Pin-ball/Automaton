import { BenchResults } from '@src/dev/BenchResults.tsx'
import { milliseconds } from '@src/dev/bench.ts'
import { HEIGHT, Preview, WIDTH } from '@src/dev/preview.ts'
import { cn } from '@src/lib/utils.ts'
import { ruleNames } from '@src/rules/catalog.ts'
import type { PointerEvent, ReactNode } from 'react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

function Control({
  active = false,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md border px-3 py-1.5 text-sm capitalize',
        active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}

export function DevPreview() {
  const [preview] = useState(() => new Preview())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snapshot = useSyncExternalStore(preview.subscribe, preview.getSnapshot)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    preview.attach(canvas)
    return () => preview.detach()
  }, [preview])

  function paintAt(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * WIDTH)
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * HEIGHT)
    preview.paint(x, y)
  }

  const status = [
    `${WIDTH}×${HEIGHT}`,
    `generation ${snapshot.generation}`,
    `population ${snapshot.population ?? '—'}`,
    `mass ${snapshot.mass?.toFixed(1) ?? '—'}`,
    `GPU ${milliseconds(snapshot.stepTime)}`,
  ]

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 p-6">
      <header className="flex w-full max-w-5xl items-baseline justify-between">
        <h1 className="font-medium">Engine preview</h1>
        <p className="text-muted-foreground font-mono text-sm">{status.join(' · ')}</p>
      </header>

      {snapshot.error ? (
        <p className="text-destructive">{snapshot.error}</p>
      ) : (
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="w-full max-w-5xl cursor-crosshair rounded-md border [image-rendering:pixelated]"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          onPointerDown={(event) => {
            drawing.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
            paintAt(event)
          }}
          onPointerMove={(event) => {
            if (drawing.current) paintAt(event)
          }}
          onLostPointerCapture={() => {
            drawing.current = false
          }}
        />
      )}

      <footer className="flex w-full max-w-5xl flex-wrap items-center gap-2">
        {ruleNames.map((name) => (
          <Control
            key={name}
            active={snapshot.ruleName === name}
            onClick={() => preview.selectRule(name)}
          >
            {name}
          </Control>
        ))}
        <span className="bg-border mx-2 h-6 w-px" />
        <Control onClick={() => preview.togglePlay()}>
          {snapshot.playing ? 'Pause' : 'Play'}
        </Control>
        <Control onClick={() => preview.stepOnce()}>Step</Control>
        <Control onClick={() => preview.reseed()}>Reseed</Control>
        <Control onClick={() => preview.clear()}>Clear</Control>
        <Control active={snapshot.benching} onClick={() => preview.runBench()}>
          {snapshot.benching ? 'Benching…' : 'Bench'}
        </Control>
        <label className="text-muted-foreground ml-auto flex items-center gap-2 font-mono text-sm">
          {snapshot.speed} steps/s
          <input
            type="range"
            min={1}
            max={60}
            value={snapshot.speed}
            onChange={(event) => preview.setSpeed(Number(event.target.value))}
          />
        </label>
      </footer>

      {(snapshot.benching || snapshot.bench.length > 0) && (
        <BenchResults results={snapshot.bench} />
      )}
    </main>
  )
}
