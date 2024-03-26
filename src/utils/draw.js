import {cellSize, POINTER, STAMPS} from "../Config.js";
import {mousePositionOnGrid} from './position.js'
import {lerpColorRGB} from "./color.js";

export function drawCells(ctx, canvas, cells, params) {
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight)
  ctx.fillStyle = params.color
  ctx.beginPath()

  const [xCenter, yCenter] = [canvas.current.clientWidth/2, canvas.current.clientHeight/2]
  const [xOffset, yOffset] = params.offset

  for (let cell of Object.keys(cells)) {
    const [xCell,yCell] = cell.split(':').map(c => parseInt(c))
    const [x, y] = [
      xCenter + xCell*cellSize*params.zoom + xOffset*params.zoom,
      yCenter + yCell*cellSize*params.zoom + yOffset*params.zoom
    ]

    if (
      x > -cellSize && x < canvas.current.clientWidth &&
      y > -cellSize && y < canvas.current.clientHeight
    ) {
      const cellValue = cells[cell]
      ctx.fillStyle = cellValue === 1 ? params.color : lerpColorRGB([250, 50, 50], [30, 30, 30], cellValue)
      ctx.fillRect(x, y, cellSize*params.zoom, cellSize*params.zoom)
    }


  }
  ctx.fill()

  // Display target
  // ctx.fillStyle = params.color
  // ctx.fillRect(xCenter, yCenter+(cellSize*params.zoom)/2-1, cellSize*params.zoom, 2)
  // ctx.fillRect(xCenter+(cellSize*params.zoom)/2-1, yCenter, 2, cellSize*params.zoom)
}

export function drawFigure(ctx, canvas, cursor, params) {
  if (cursor === null) return
  const [x,y] = mousePositionOnGrid(canvas, cursor, params)

  ctx.fillStyle = '#FAFAFA50'
  let figure = [[0,0]]
  switch (params.tool) {
    case 2:
      figure = STAMPS.find(s => s.id === params.stamp).value
      break
    case 3:
      figure = POINTER.find(s => s.id === params.erase).value
      break
  }

  for(let [xFig, yFig] of figure) {
    ctx.fillRect(
      x+xFig*cellSize*params.zoom,
      y+yFig*cellSize*params.zoom,
      cellSize*params.zoom,
      cellSize*params.zoom)
  }
}
