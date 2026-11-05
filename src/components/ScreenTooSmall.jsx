export default function ScreenTooSmall() {
  return (
    <div className="flex h-full flex-col px-4 py-8">
      <header>
        <span className="bg-card inline-block rounded-full p-2">
          <img src="./logo_simple.svg" alt="Cellular Automata" className="size-8" />
        </span>
      </header>
      <main className="m-auto max-w-sm rounded-lg px-5 py-3 text-center">
        <h3 className="text-muted-foreground mb-1 text-sm font-extralight">Screen too small</h3>
        <p>
          Cellular Automata needs more room to grow. Open it on a larger screen or enlarge your
          window.
        </p>
      </main>
    </div>
  )
}
