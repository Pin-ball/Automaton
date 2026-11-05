import Box from '@src/components/Box'
import Canvas from '@src/components/Canvas'
import Warning from '@src/components/Warning'
import { step } from '@src/store/reducer/automata.js'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const SLOW_TICKS_LIMIT = 5

export default function Automata() {
  const dispatch = useDispatch()
  const running = useSelector((store) => store.automata.running)
  const delta = useSelector((store) => store.automata.params.delta)
  const [slowTicks, setSlowTicks] = useState(0)

  useEffect(() => {
    if (!running) return

    const interval = 1000 / delta
    let timer

    function tick() {
      const start = performance.now()
      dispatch(step())
      const elapsed = performance.now() - start
      setSlowTicks((count) => (elapsed > interval ? count + 1 : 0))
      timer = setTimeout(tick, Math.max(0, interval - elapsed))
    }

    tick()
    return () => clearTimeout(timer)
  }, [running, delta, dispatch])

  return (
    <Box padding={false} className="relative grow overflow-hidden">
      <Canvas />
      {slowTicks > SLOW_TICKS_LIMIT ? (
        <Warning>Slowness detected, please slow down or reset the simulation</Warning>
      ) : null}
    </Box>
  )
}
