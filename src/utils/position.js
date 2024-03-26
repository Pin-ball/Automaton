import {cellSize} from "../Config.js";

export function mousePositionOnGrid(canvas, cursor, params) {
  const [xMouse, yMouse] = cursor
  const cell = cellSize*params.zoom
  const [xOffset, yOffset] = params.offset
  const {left: xCanvas, top: yCanvas} = canvas.current.getBoundingClientRect()
  const [xShift, yShift] = [(xOffset * params.zoom) % cell, (yOffset * params.zoom) % cell]
  const [xCenter, yCenter] = [canvas.current.clientWidth/2, canvas.current.clientHeight/2]

  const [x, y] = [
    Math.floor((xMouse - xCanvas - xShift - xCenter) / cell) * cell + xShift + xCenter,
    Math.floor((yMouse - yCanvas - yShift - yCenter) / cell) * cell + yShift + yCenter
  ]

  // console.log([x, y])
  return [x,y]
}

export function mouseGridCell(canvas, cursor, params) {
  const [xMouse, yMouse] = cursor
  const [xOffset, yOffset] = params.offset
  const {left: xCanvas, top: yCanvas} = canvas.current.getBoundingClientRect()
  const [xCenter, yCenter] = [canvas.current.clientWidth/2, canvas.current.clientHeight/2]

  const [x, y] = [
    xMouse - xCanvas - xOffset*params.zoom - xCenter,
    yMouse - yCanvas - yOffset*params.zoom - yCenter
  ]
  const [xGrid, yGrid] = [
    Math.floor(x / (cellSize*params.zoom)),
    Math.floor(y / (cellSize*params.zoom))
  ]

  // console.log([xGrid, yGrid])
  return [xGrid, yGrid]
}

export function getCellsOnLine([x0,y0], [x1,y1]) {
  let cells = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  while (true) {
    cells.push({x: Math.floor(x0), y: Math.floor(y0)});

    if (x0 === x1 && y0 === y1) break;

    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return cells;
}

// Example usage:
// let startPoint = { x: 2.3, y: 1.8 };
// let endPoint = { x: 10.3, y: 6.2 };
// let cells = getCellsOnLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y);