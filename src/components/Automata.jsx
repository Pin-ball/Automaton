import { cellsCount, incLoop, refresh } from "@src/store/reducer/automata.js";
import { useDispatch, useSelector } from "react-redux";
import { Box, Canvas, Warning } from "@src/components";
import useCells from "@src/components/Cells.jsx";
import { useEffect, useState } from "react";

let isFirstRender = true

export default function Automata() {
  // console.log('--> Refresh: Automata')
  const {cells, action, cycle, reset} = useCells()
  const dispatch = useDispatch()
  const state = useSelector(store => store.automata)
  const [speedFlag, setSpeedFlag] = useState(0)


  // TODO: To refactor
  useEffect(() => {
    const c = Object.values(cells)
    dispatch(cellsCount({count: c.filter(c => c >= 1).length}))
  }, cells.length);


  useEffect(() => {
    if (!state.running) return

    dispatch(incLoop())
    const elapsedTime = cycle()
    const delay = Math.max(0, 1000 / state.params.delta - elapsedTime);
    const timer = setTimeout(()=>{ dispatch(refresh()) }, delay)

    if (elapsedTime > 1000 / state.params.delta) {
      console.log("(", elapsedTime, "ms) Cycle processing time exceeded (", Object.keys(cells).length, "cells)")
      setSpeedFlag(s => s + 1)
    }
    else if(speedFlag > 0) {
      setSpeedFlag(0)
    }

    return () => { clearTimeout(timer) }
  }, [state.running, state.refresh]);


  useEffect(() => {
    if (isFirstRender || state.running) return;
    dispatch(incLoop())
    cycle()
  }, [state.refresh]);


  useEffect(() => {
    if (isFirstRender) return
    reset()
  }, [state.reset]);

  // TODO: Create visual warning for user
  useEffect(() => {
    if (speedFlag > 5 )
      console.log('slowness detected, please slow down or reset the simulation')
  }, [speedFlag]);


  useEffect(() => {
    isFirstRender = false
  }, []);

  return (
    <Box padding={false} className='grow overflow-hidden relative'>
      <Canvas cells={cells} action={action}/>
      { speedFlag > 5
        ? <Warning>Slowness detected, please slow down or reset the simulation</Warning>
        : null
      }
    </Box>
  )
}
