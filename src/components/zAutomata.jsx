import useCells from "@src/components/Cells.jsx";
import useStore from "@src/store/zStore.js";
import { Canvas } from "@src/components";
import { useEffect } from "react";

let isFirstRender = true

export default function Automata() {
  // console.log('--> Refresh: Automata')
  const {cells, action, cycle, reset} = useCells()
  const {running, set, params, incLoop, refresh} = useStore();


  useEffect(() => {
    if (!running) return

    incLoop()
    const elapsedTime = cycle()
    const delay = Math.max(0, 1000 / params.delta - elapsedTime);
    const timer = setTimeout(()=>{ refresh() }, delay)

    if (elapsedTime > 1000 / params.delta)
      console.log("!! (",elapsedTime,"ms) Cycle processing time exceeded (",Object.keys(cells).length,"cells)")

    return () => { clearTimeout(timer) }
  }, [running, refresh]);


  useEffect(() => {
    if (isFirstRender || running) return;
    incLoop()
    cycle()
  }, [refresh]);


  useEffect(() => {
    if (isFirstRender) return
    reset()
  }, [set]);


  useEffect(() => {
    isFirstRender = false
  }, []);

  return (
    <Canvas cells={cells} action={action}/>
  )
}
