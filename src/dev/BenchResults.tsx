import type { BenchResult } from '@src/dev/bench.ts'
import { BENCH_HEIGHT, BENCH_WIDTH, BUDGET_MS, milliseconds, scenarios } from '@src/dev/bench.ts'
import { cn } from '@src/lib/utils.ts'

export function BenchResults({ results }: { results: BenchResult[] }) {
  return (
    <table className="w-full max-w-5xl font-mono text-sm">
      <thead className="text-muted-foreground text-left">
        <tr>
          <th className="py-2 font-normal">
            Bench {BENCH_WIDTH}×{BENCH_HEIGHT}, budget {BUDGET_MS} ms
          </th>
          <th className="py-2 text-right font-normal">Wall clock / step</th>
          <th className="py-2 text-right font-normal">GPU, one step</th>
          <th className="py-2 text-right font-normal">Population</th>
        </tr>
      </thead>
      <tbody>
        {scenarios.map(({ name }) => {
          const result = results.find((entry) => entry.name === name)
          return (
            <tr key={name} className="border-t">
              <td className="py-2">{name}</td>
              <td
                className={cn(
                  'py-2 text-right',
                  result && result.wallTime > BUDGET_MS && 'text-destructive',
                )}
              >
                {result ? milliseconds(result.wallTime) : '…'}
              </td>
              <td className="py-2 text-right">{result ? milliseconds(result.stepTime) : '…'}</td>
              <td className="py-2 text-right">{result?.population ?? '…'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
