import { z } from 'zod'

export function parseInput<Schema extends z.ZodType>(
  schema: Schema,
  value: unknown,
  label: string,
): z.output<Schema> {
  const result = schema.safeParse(value)
  if (!result.success) throw new RangeError(`Invalid ${label}: ${z.prettifyError(result.error)}`)
  return result.data
}
