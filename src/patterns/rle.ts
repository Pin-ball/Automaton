export type Grid = { width: number; height: number; state: Float32Array }

const HEADER = /^x\s*=\s*(\d+)\s*,\s*y\s*=\s*(\d+)/i
const TOKEN = /(\d*)([bo$!])/g

export function parseRle(text: string): Grid {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
  const header = HEADER.exec(lines[0] ?? '')
  if (!header) throw new SyntaxError('RLE header "x = …, y = …" is missing')
  const width = Number(header[1])
  const height = Number(header[2])
  const state = new Float32Array(width * height)

  const body = lines.slice(1).join('').replace(/\s/g, '')
  const unknown = body.replace(TOKEN, '')
  if (unknown !== '') throw new SyntaxError(`Unexpected RLE content "${unknown}"`)

  let x = 0
  let y = 0
  for (const [, digits, tag] of body.matchAll(TOKEN)) {
    if (tag === '!') break
    const count = digits ? Number(digits) : 1
    if (tag === '$') {
      x = 0
      y += count
      continue
    }
    if (x + count > width || y >= height) throw new RangeError('RLE cells exceed the declared size')
    if (tag === 'o') state.fill(1, y * width + x, y * width + x + count)
    x += count
  }
  return { width, height, state }
}
