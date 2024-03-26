import { POINTER, RULES, STAMPS } from "@src/Config.js";
import { getCellsOnLine } from "@src/utils/position.js";
import { useSelector } from "react-redux";
import { useImmer } from "use-immer";

// TODO : Use gpu for parallel processing
export default function useCells() {
  const [cells, setCells] = useImmer({})
  const state = useSelector(store => store.automata)

  function cycle() {
    const startTime = Date.now()
    let newCells = {...cells}
    let locals = {}

    for (let position of Object.keys(cells)) {

      let count = 0
      const [xCell, yCell] = position.split(':').map(c => parseInt(c))

      if (cells[position] === 1) {
        for (const [xRule, yRule] of RULES) {
          const check = (xCell + xRule) + ':' + (yCell + yRule)
          if (cells[check] === 1)
            count += 1
          else
            locals[check] !== undefined ? locals[check]++ : locals[check] = 1;
        }
      }

      if (!state.params.decay) {
        if (count !== 2 && count !== 3)
          delete newCells[position]
      }
      else {
        const cellValue = cells[position]

        if ((count !== 2 && count !== 3) || cellValue < 1)
          newCells[position] = (cellValue - 1 / state.params.tray).toFixed(2)
        if (cellValue <= 0)
          delete newCells[position]
      }
    }

    for (let [pos, count] of Object.entries(locals)) {
      if (count === 3 )
        newCells[pos] = 1
    }

    setCells(newCells)
    return Date.now() - startTime;

    // if (!Object.keys(newCells).length) dispatch(stopRunning())
  }

  function action(cell, prevCell = cell) {
    switch (state.params.tool) {
      case 0:
        click(cell)
        break
      case 1:
        line(getCellsOnLine(cell, prevCell))
        break
      case 2:
        stamp(cell)
        break
      case 3:
        erase(cell)
        break
      default:
        console.log('Tool unknown')
        break
    }
  }

  function click([x, y]) {
    const position = x+':'+y

    if (cells[position] === undefined) {
      setCells(draft => {
        draft[position] = 1
      })
    }
    else {
      setCells(draft => {
        delete draft[position]
      })
    }
  }

  function stamp([x, y]) {
    for(let [xFig, yFig] of  STAMPS.find(s => s.id === state.params.stamp).value) {
      const position = (x + xFig) + ':' + (y + yFig)
      setCells(draft => {
        draft[position] = 1
      })
    }
  }

  function erase([x, y]) {
    for(let [xFig, yFig] of POINTER.find(s=> s.id === state.params.erase).value) {
      const position = (x+xFig) + ':' + (y+yFig)
      setCells(draft => {
        delete draft[position]
      })
    }
  }

  function line(cells) {
    for (const cell of cells) {
      const {x, y} = cell
      const position = x+':'+y
      setCells(draft => {
        draft[position] = 1
      })
    }
  }

  function reset() {
    setCells({})
  }

  function getPattern()  {
    let pattern = '['

    Object.keys(cells).forEach(cell => {
      const [x,y] = cell.split(':')
      pattern += `[${x},${y}],`
    })

    pattern = pattern.replace(/,\s*$/, ']');
    console.log('> Pattern: \n', pattern)
  }

  return {
    cells,
    action,
    cycle,
    reset,
  }
}
