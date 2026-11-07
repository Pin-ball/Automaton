import type { PresetName } from '@src/dev/preview.ts'
import { HEIGHT, Preview, WIDTH } from '@src/dev/preview.ts'
import { cn } from '@src/lib/utils.ts'
import type { PointerEvent, ReactNode } from 'react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const PRESETS: PresetName[] = ['conway', 'bosco', 'lenia']

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

  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <header className="flex w-full max-w-5xl items-baseline justify-between">
        <h1 className="font-medium">Engine preview</h1>
        <p className="text-muted-foreground font-mono text-sm">
          {WIDTH}×{HEIGHT} · generation {snapshot.generation}
        </p>
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
        {PRESETS.map((preset) => (
          <Control
            key={preset}
            active={snapshot.preset === preset}
            onClick={() => preview.setPreset(preset)}
          >
            {preset}
          </Control>
        ))}
        <span className="bg-border mx-2 h-6 w-px" />
        <Control onClick={() => preview.togglePlay()}>
          {snapshot.playing ? 'Pause' : 'Play'}
        </Control>
        <Control onClick={() => preview.stepOnce()}>Step</Control>
        <Control onClick={() => preview.randomize()}>Randomize</Control>
        <Control onClick={() => preview.clear()}>Clear</Control>
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
    </main>
  )
}
