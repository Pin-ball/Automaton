import { POINTER, RULES, STAMPS } from '@src/Config.js'
import { getCellsOnLine } from '@src/utils/position.js'

const key = (x, y) => `${x}:${y}`

export function nextGeneration(cells, { decay, tray }) {
  const next = { ...cells }
  const neighbours = {}

  for (const [position, value] of Object.entries(cells)) {
    const [x, y] = position.split(':').map(Number)
    let count = 0

    if (!decay && value < 1) {
      delete next[position]
      continue
    }

    if (value === 1) {
      for (const [dx, dy] of RULES) {
        const around = key(x + dx, y + dy)
        if (cells[around] === 1) {
          count++
        } else {
          neighbours[around] = (neighbours[around] ?? 0) + 1
        }
      }
    }

    const survives = count === 2 || count === 3

    if (decay) {
      if (!survives || value < 1) {
        next[position] = Math.round((value - 1 / tray) * 100) / 100
      }
      if (next[position] <= 0) {
        delete next[position]
      }
    } else if (!survives) {
      delete next[position]
    }
  }

  for (const [position, count] of Object.entries(neighbours)) {
    if (count === 3) next[position] = 1
  }

  return next
}

function figure(shapes, id) {
  return shapes.find((shape) => shape.id === id).value
}

export function editCells(cells, params, [x, y], previous = [x, y]) {
  switch (params.tool) {
    case 0: {
      const position = key(x, y)
      if (cells[position] === undefined) cells[position] = 1
      else delete cells[position]
      break
    }
    case 1:
      for (const cell of getCellsOnLine([x, y], previous)) {
        cells[key(cell.x, cell.y)] = 1
      }
      break
    case 2:
      for (const [dx, dy] of figure(STAMPS, params.stamp)) {
        cells[key(x + dx, y + dy)] = 1
      }
      break
    case 3:
      for (const [dx, dy] of figure(POINTER, params.erase)) {
        delete cells[key(x + dx, y + dy)]
      }
      break
  }
}
