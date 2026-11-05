import PointsBackground from '@src/assets/points_background.png'
import useElementSize from '@src/hooks/useElementSize.js'
import { applyTool, updateParam } from '@src/store/reducer/automata.js'
import { drawCells, drawFigure, mouseGridCell } from '@src/utils'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// TODO: Add "drawn pattern selection" mode
export default function Canvas() {
  const dispatch = useDispatch()
  const canvasRef = useRef(null)
  const drag = useRef({ startPoint: null, startCanvasOffset: null })
  const size = useElementSize(canvasRef)
  const [cursor, setCursor] = useState(null)
  const cells = useSelector((store) => store.automata.cells)
  const params = useSelector((store) => store.automata.params)
  const running = useSelector((store) => store.automata.running)
  const showBackground = Object.keys(cells).length <= 0 && !running

  useEffect(() => {
    if (!size) return
    const canvas = canvasRef.current
    const [width, height] = size
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
    const ctx = canvas.getContext('2d')
    drawCells(ctx, canvasRef, cells, params)
    drawFigure(ctx, canvasRef, cursor, params)
  }, [size, cells, cursor, params])

  function mouseDown(e) {
    drag.current.startPoint = [e.clientX, e.clientY]
    drag.current.startCanvasOffset = params.offset
  }

  function mouseMove(e) {
    const position = [e.clientX, e.clientY]
    const previousPosition = cursor ?? position
    setCursor(position)

    if (drag.current.startPoint === null) return

    switch (params.tool) {
      case 1:
        mouseDraw(position, previousPosition)
        break
      default: {
        const {
          startPoint: [xPoint, yPoint],
          startCanvasOffset: [xOffset, yOffset],
        } = drag.current
        dispatch(
          updateParam({
            param: 'offset',
            value: [
              xOffset + (e.clientX - xPoint) / params.zoom,
              yOffset + (e.clientY - yPoint) / params.zoom,
            ],
          }),
        )
        break
      }
    }
  }

  function mouseUp(e) {
    mouseClick([e.clientX, e.clientY])
    drag.current.startPoint = null
    drag.current.startCanvasOffset = null
  }

  function mouseLeave() {
    setCursor(null)
    drag.current.startPoint = null
    drag.current.startCanvasOffset = null
  }

  function mouseClick(position) {
    if (isMouseDrag()) return

    const cell = mouseGridCell(canvasRef, position, params)
    dispatch(applyTool({ cell }))
  }

  function mouseDraw(position, previousPosition) {
    const cell = mouseGridCell(canvasRef, position, params)
    const previousCell = mouseGridCell(canvasRef, previousPosition, params)
    dispatch(applyTool({ cell, previousCell }))
  }

  function isMouseDrag() {
    if (!drag.current.startPoint) return true

    const [xDrag, yDrag] = drag.current.startCanvasOffset
    const [xOffset, yOffset] = params.offset
    return xDrag < xOffset - 3 || xDrag > xOffset + 3 || yDrag < yOffset - 3 || yDrag > yOffset + 3
  }

  return (
    <>
      {showBackground && (
        <img
          src={PointsBackground}
          className="absolute left-1/2 m-auto h-full -translate-x-1/2 p-4"
          alt=""
        />
      )}

      <canvas
        className="absolute top-0 left-0 h-full w-full"
        ref={canvasRef}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseLeave={mouseLeave}
      ></canvas>
    </>
  )
}
