export default function Mobile() {
  return (
    <div className="flex flex-col h-full px-4 py-8">
      <header>
        <span className="inline-block p-2 rounded-full bg-c-neutral-700">
          <img src="./logo_simple.svg" alt="logo" className="size-8" />
        </span>
      </header>
      <main className="px-5 py-3 m-auto rounded-lg">
        <h3 className="mb-1 text-sm font-extralight text-c-neutral-400">
          Information
        </h3>
        <p>This simulator is only available on Desktop</p>
      </main>
    </div>
  );
}
