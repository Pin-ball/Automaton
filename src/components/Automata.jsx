import Box from "@src/components/Box";
import Canvas from "@src/components/Canvas";
import useCells from "@src/components/Cells.jsx";
import Warning from "@src/components/Warning";
import { cellsCount, incLoop, refresh } from "@src/store/reducer/automata.js";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const maxSpeedFlags = 5;
let isFirstRender = true;

export default function Automata() {
  // console.log(">> Refresh: Automata");

  const dispatch = useDispatch();
  const [speedFlags, setSpeedFlags] = useState(0);
  const { cells, action, cycle, reset } = useCells();
  const state = useSelector((store) => store.automata);

  useEffect(() => {
    dispatch(
      cellsCount({ count: Object.values(cells).filter((c) => c >= 1).length })
    );
  }, cells.length);

  useEffect(() => {
    if (!state.running) return;

    dispatch(incLoop());
    const elapsedTime = cycle();
    const delay = Math.max(0, 1000 / state.params.delta - elapsedTime);
    const timer = setTimeout(() => {
      dispatch(refresh());
    }, delay);

    if (elapsedTime > 1000 / state.params.delta) {
      // console.log(`(${elapsedTime}ms) Cycle processing time exceeded (${Object.keys(cells).length}cells)`);
      setSpeedFlags((s) => s + 1);
    } else if (speedFlags > 0) {
      setSpeedFlags(0);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [state.running, state.refresh]);

  useEffect(() => {
    if (isFirstRender || state.running) return;
    dispatch(incLoop());
    cycle();
  }, [state.refresh]);

  useEffect(() => {
    if (isFirstRender) return;
    reset();
  }, [state.reset]);

  useEffect(() => {
    if (speedFlags > maxSpeedFlags)
      console.log(
        "slowness detected, please slow down or reset the simulation"
      );
  }, [speedFlags]);

  useEffect(() => {
    isFirstRender = false;
  }, []);

  return (
    <Box padding={false} className="relative overflow-hidden grow">
      <Canvas cells={cells} action={action} />
      {speedFlags > maxSpeedFlags ? (
        <Warning>
          Slowness detected, please slow down or reset the simulation
        </Warning>
      ) : null}
    </Box>
  );
}
