import { cellSize, POINTER, STAMPS } from "../Config.js";
import { lerpColorRGB } from "./color.js";
import { mousePositionOnGrid } from './position.js';

export function drawCells(ctx, canvas, cells, params) {
  const width = canvas.current.clientWidth;
  const height = canvas.current.clientHeight;
  const { zoom, offset: [xOffset, yOffset], color } = params;
  const halfW = width / 2;
  const halfH = height / 2;
  const size = cellSize * zoom;

  ctx.clearRect(0, 0, width, height);

  if (Object.keys(cells).length === 0) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1, 1);
    return;
  }

  for (const [pos, cellValue] of Object.entries(cells)) {
    const [xCell, yCell] = pos.split(':').map(Number);
    const x = halfW + xCell * size + xOffset * zoom;
    const y = halfH + yCell * size + yOffset * zoom;

    if (x > -cellSize && x < width && y > -cellSize && y < height) {
      ctx.fillStyle =
        cellValue === 1
          ? color
          : lerpColorRGB([250, 50, 50], [30, 30, 30], cellValue);
      ctx.fillRect(x, y, size, size);
    }
  }

  // Display target
  // ctx.fillStyle = params.color
  // ctx.fillRect(xCenter, yCenter+(cellSize*params.zoom)/2-1, cellSize*params.zoom, 2)
  // ctx.fillRect(xCenter+(cellSize*params.zoom)/2-1, yCenter, 2, cellSize*params.zoom)
}

export function drawFigure(ctx, canvas, cursor, params) {
  if (cursor === null) return
  const [x, y] = mousePositionOnGrid(canvas, cursor, params)

  ctx.fillStyle = '#FAFAFA50'
  let figure = [[0, 0]]
  switch (params.tool) {
    case 2:
      figure = STAMPS.find(s => s.id === params.stamp).value
      break
    case 3:
      figure = POINTER.find(s => s.id === params.erase).value
      break
  }

  for (let [xFig, yFig] of figure) {
    ctx.fillRect(
      x + xFig * cellSize * params.zoom,
      y + yFig * cellSize * params.zoom,
      cellSize * params.zoom,
      cellSize * params.zoom)
  }
}
