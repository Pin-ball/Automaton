import { mouseGridCell, drawCells, drawFigure } from '@src/utils';
import { updateParam} from '@src/store/reducer/automata.js';
import useWindowSize from '@src/hooks/useWindowSize.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import Points from "@src/assets/Points.png";
import PropTypes from 'prop-types';

let ctx = null
let drag = {startPoint: null, startCanvasOffset: null}

// TODO: Add 'selection' mode
export default function Canvas({cells, action}) {
  // console.log('--> Refresh: Canvas')
  const dispatch = useDispatch()
  const state = useSelector(store => store.automata)
  const canvasRef = useRef(null)
  const [cursor, setCursor] = useState(null)
  const [width, height] = useWindowSize();


  useEffect(() => {
    ctx = canvasRef.current.getContext('2d')
  }, []);


  useEffect(() => {
    draw()
  }, [state.params, cells, cursor, width, height]);


  const draw = () => {
    drawCells(ctx, canvasRef, cells, state.params)
    drawFigure(ctx, canvasRef, cursor, state.params)
  }


  // Canvas Actions
  function mouseDown(e) {
    drag.startPoint = [e.clientX, e.clientY]
    drag.startCanvasOffset = state.params.offset
  }

  function mouseMove(e) {
    const previousPosition = cursor
    setCursor([e.clientX, e.clientY])

    if (drag.startPoint === null) return

    switch (state.params.tool) {
      case 1:
        mouseDraw([e.clientX, e.clientY], previousPosition)
        break
      default: {
        const {startPoint: [xPoint, yPoint], startCanvasOffset: [xOffset, yOffset]} = drag
        dispatch(updateParam({
          param: 'offset',
          value: [xOffset + (e.clientX - xPoint) / state.params.zoom, yOffset +(e.clientY - yPoint) / state.params.zoom]
      }))
        break
      }
    }
  }

  function mouseUp(e) {
    mouseClick([e.clientX, e.clientY])
    drag.startPoint = null
    drag.startCanvasOffset = null
  }

  function mouseLeave() {
    setCursor(null)
    drag.startPoint = null
    drag.startCanvasOffset = null
  }

  function mouseClick(cursor) {
    if (isMouseDrag()) return

    const cell = mouseGridCell(canvasRef, cursor, state.params)
    action(cell)
  }

  function mouseDraw(cursor, previousCursor) {
    const cell = mouseGridCell(canvasRef, cursor, state.params)
    const previousCell = mouseGridCell(canvasRef, previousCursor, state.params)
    action(cell, previousCell)
  }

  function isMouseDrag() {
    if (!drag.startPoint) return true

    const [xDrag, yDrag] = drag.startCanvasOffset
    const [xOffset, yOffset] = state.params.offset
    return xDrag < xOffset - 3 || xDrag > xOffset + 3 || yDrag < yOffset - 3 || yDrag > yOffset + 3;
  }


  return (
    <>
      {/* TODO: To refactor */}
      {Object.keys(cells).length <= 0 && state.running === false
        ? < img src={Points} className='m-auto h-full p-4 absolute left-0 left-1/2 transform -translate-x-1/2' alt='Points'/>
        : null
      }

      <canvas
        className='w-full h-full absolute top-0 left-0'
        ref={canvasRef}
        width={canvasRef?.current?.clientWidth}
        height={canvasRef?.current?.clientHeight}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseLeave={mouseLeave}>
      </canvas>
    </>
  )
}

Canvas.displayName = 'Canvas';
Canvas.propTypes = {
  cells: PropTypes.object,
  action: PropTypes.func
}
