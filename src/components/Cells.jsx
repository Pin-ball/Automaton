import { POINTER, RULES, STAMPS } from "@src/Config.js";
import { getCellsOnLine } from "@src/utils/position.js";
import { useSelector } from "react-redux";
import { useImmer } from "use-immer";

// @todo : Use gpu for parallel processing
export default function useCells() {
  // console.log(">> Refresh: useCells");

  // Change Cells object for a new Map()
  const [cells, setCells] = useImmer({});
  const state = useSelector((store) => store.automata);

  function cycle() {
    const startTime = Date.now();
    const { decay, tray } = state.params;

    const newCells = { ...cells };
    const locals = {};

    for (const [position, cellValue] of Object.entries(cells)) {
      const [xCell, yCell] = position.split(":").map(Number);
      let count = 0;

      if (!decay && cellValue < 1) {
        delete newCells[position];
        continue;
      }

      if (cellValue === 1) {
        for (const [dx, dy] of RULES) {
          const check = `${xCell + dx}:${yCell + dy}`;
          if (cells[check] === 1) {
            count++;
          } else {
            locals[check] = (locals[check] ?? 0) + 1;
          }
        }
      }

      const survives = count === 2 || count === 3;

      if (decay) {
        if (!survives || cellValue < 1) {
          newCells[position] = Math.round((cellValue - 1 / tray) * 100) / 100;
        }
        if (newCells[position] <= 0) {
          delete newCells[position];
        }
      } else if (!survives) {
        delete newCells[position];
      }
    }

    for (const [pos, count] of Object.entries(locals)) {
      if (count === 3) newCells[pos] = 1;
    }

    setCells(newCells);
    return Date.now() - startTime;

    // if (!Object.keys(newCells).length) dispatch(stopRunning())
  }

  function action(cell, prevCell = cell) {
    switch (state.params.tool) {
      case 0:
        click(cell);
        break;
      case 1:
        line(getCellsOnLine(cell, prevCell));
        break;
      case 2:
        stamp(cell);
        break;
      case 3:
        erase(cell);
        break;
      default:
        console.log("Unknown tool");
        break;
    }
  }

  function click([x, y]) {
    const position = x + ":" + y;

    if (cells[position] === undefined) {
      setCells((draft) => {
        draft[position] = 1;
      });
    } else {
      setCells((draft) => {
        delete draft[position];
      });
    }
  }

  function stamp([x, y]) {
    for (let [xFig, yFig] of STAMPS.find((s) => s.id === state.params.stamp)
      .value) {
      const position = x + xFig + ":" + (y + yFig);
      setCells((draft) => {
        draft[position] = 1;
      });
    }
  }

  function erase([x, y]) {
    for (let [xFig, yFig] of POINTER.find((s) => s.id === state.params.erase)
      .value) {
      const position = x + xFig + ":" + (y + yFig);
      setCells((draft) => {
        delete draft[position];
      });
    }
  }

  function line(cells) {
    for (const cell of cells) {
      const { x, y } = cell;
      const position = x + ":" + y;
      setCells((draft) => {
        draft[position] = 1;
      });
    }
  }

  function reset() {
    setCells({});
  }

  return {
    cells,
    action,
    cycle,
    reset,
  };
}
