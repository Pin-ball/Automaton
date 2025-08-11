import PointsBackground from "@src/assets/points_background.png";
import useWindowSize from "@src/hooks/useWindowSize.jsx";
import { updateParam } from "@src/store/reducer/automata.js";
import { drawCells, drawFigure, mouseGridCell } from "@src/utils";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

let ctx = null;
let drag = { startPoint: null, startCanvasOffset: null };

// TODO: Add "drawn pattern selection" mode
export default function Canvas({ cells, action }) {
  // console.log(">> Refresh: Canvas");

  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const [width, height] = useWindowSize();
  const [cursor, setCursor] = useState(null);
  const state = useSelector((store) => store.automata);
  const showBackground =
    Object.keys(cells).length <= 0 && state.running === false;

  useEffect(() => {
    ctx = canvasRef.current.getContext("2d");
  }, []);

  useEffect(() => {
    draw();
  }, [state.params, cells, cursor, width, height]);

  const draw = () => {
    drawCells(ctx, canvasRef, cells, state.params);
    drawFigure(ctx, canvasRef, cursor, state.params);
  };

  // Canvas Actions
  function mouseDown(e) {
    drag.startPoint = [e.clientX, e.clientY];
    drag.startCanvasOffset = state.params.offset;
  }

  function mouseMove(e) {
    const previousPosition = cursor;
    setCursor([e.clientX, e.clientY]);

    if (drag.startPoint === null) return;

    switch (state.params.tool) {
      case 1:
        mouseDraw([e.clientX, e.clientY], previousPosition);
        break;
      default: {
        const {
          startPoint: [xPoint, yPoint],
          startCanvasOffset: [xOffset, yOffset],
        } = drag;
        dispatch(
          updateParam({
            param: "offset",
            value: [
              xOffset + (e.clientX - xPoint) / state.params.zoom,
              yOffset + (e.clientY - yPoint) / state.params.zoom,
            ],
          })
        );
        break;
      }
    }
  }

  function mouseUp(e) {
    mouseClick([e.clientX, e.clientY]);
    drag.startPoint = null;
    drag.startCanvasOffset = null;
  }

  function mouseLeave() {
    setCursor(null);
    drag.startPoint = null;
    drag.startCanvasOffset = null;
  }

  function mouseClick(cursor) {
    if (isMouseDrag()) return;

    const cell = mouseGridCell(canvasRef, cursor, state.params);
    action(cell);
  }

  function mouseDraw(cursor, previousCursor) {
    const cell = mouseGridCell(canvasRef, cursor, state.params);
    const previousCell = mouseGridCell(canvasRef, previousCursor, state.params);
    action(cell, previousCell);
  }

  function isMouseDrag() {
    if (!drag.startPoint) return true;

    const [xDrag, yDrag] = drag.startCanvasOffset;
    const [xOffset, yOffset] = state.params.offset;
    return (
      xDrag < xOffset - 3 ||
      xDrag > xOffset + 3 ||
      yDrag < yOffset - 3 ||
      yDrag > yOffset + 3
    );
  }

  return (
    <>
      {showBackground && (
        <img
          src={PointsBackground}
          className="absolute left-0 h-full p-4 m-auto transform -translate-x-1/2 left-1/2"
          alt="Canvas background"
        />
      )}

      <canvas
        className="absolute top-0 left-0 w-full h-full"
        ref={canvasRef}
        width={canvasRef?.current?.clientWidth}
        height={canvasRef?.current?.clientHeight}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseLeave={mouseLeave}
      ></canvas>
    </>
  );
}

Canvas.displayName = "Canvas";
Canvas.propTypes = {
  cells: PropTypes.object,
  action: PropTypes.func,
};
