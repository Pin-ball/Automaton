import {
  ArrowPathRoundedSquareIcon,
  Battery0Icon,
  BoltIcon,
  ForwardIcon,
  PaintBrushIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline/index.js'
import { POINTER, STAMPS } from '@src/Config.js'
import Box from '@src/components/Box'
import Button from '@src/components/Button'
import Selector from '@src/components/Selector'
import Switch from '@src/components/Switch'
import {
  reset,
  selectPopulation,
  step,
  toggleParam,
  toggleRunning,
  updateParam,
} from '@src/store/reducer/automata.js'
import { useDispatch, useSelector } from 'react-redux'
import { Slider } from 'rsuite'

// @todo: Handle show/hide menu
// @todo: Handle keyboard control
export default function Menu() {
  const dispatch = useDispatch()
  const state = useSelector((store) => store.automata)
  const population = useSelector(selectPopulation)

  function changeParam(param, value) {
    dispatch(updateParam({ param, value }))
  }

  function chooseStamp(id) {
    dispatch(updateParam({ param: 'stamp', value: id }))
    dispatch(updateParam({ param: 'tool', value: 2 }))
  }

  function chooseErase(id) {
    dispatch(updateParam({ param: 'erase', value: id }))
    dispatch(updateParam({ param: 'tool', value: 3 }))
  }

  return (
    <>
      <Box title={'Tools'}>
        <div className="flex flex-wrap gap-2">
          <Button active={state.params.tool === 0} onClick={() => changeParam('tool', 0)}>
            <PencilIcon className="size-6 stroke-inherit" />
          </Button>

          <Selector
            label="Stamp"
            icon={<BoltIcon className="size-6 stroke-inherit" />}
            options={STAMPS}
            value={state.params.stamp}
            active={state.params.tool === 2}
            onSelect={chooseStamp}
          />

          <Button active={state.params.tool === 1} onClick={() => changeParam('tool', 1)}>
            <PaintBrushIcon className="size-6 stroke-inherit" />
          </Button>

          <Selector
            label="Eraser"
            icon={<Battery0Icon className="size-6 rotate-135 stroke-inherit" />}
            options={POINTER}
            value={state.params.erase}
            active={state.params.tool === 3}
            onSelect={chooseErase}
          />

          <Button disabled>
            <ViewfinderCircleIcon className="stroke-card size-6" />
          </Button>
        </div>
      </Box>

      <div className="flex gap-2.5">
        <Box className="w-1/2">
          <span className="text-muted-foreground mr-1 text-sm font-extralight">Iteration</span>
          <p className="text-xl">{state.loop}</p>
        </Box>
        <Box className="w-1/2">
          <span className="text-muted-foreground mr-1 text-sm font-extralight">Cells</span>
          <p className="text-xl">{population}</p>
        </Box>
      </div>

      <Box className="grow" title={'Options'}>
        <div className="flex flex-col gap-2">
          <Switch
            onClick={() => dispatch(toggleParam({ param: 'decay' }))}
            active={state.params.decay}
          >
            Decay
          </Switch>

          <Switch
            disabled
            onClick={() => dispatch(toggleParam({ param: 'center' }))}
            active={state.params.center}
          >
            Centered
          </Switch>

          <Switch disabled onClick={() => dispatch(toggleParam({ param: 'funky' }))} active={false}>
            Funky
          </Switch>
        </div>
      </Box>

      <Box title={'Settings'}>
        <div>
          <span className="text-muted-foreground mr-2 text-sm font-extralight">Speed</span>
          {state.params.delta} /s
        </div>
        <div className="bg-secondary mb-3 rounded-lg">
          <Slider
            className="group mx-4 py-4"
            barClassName="h-0.5 bg-input group-hover:bg-muted-foreground"
            handleClassName="top-[20%]
                before:h-5 before:w-5 before:-ml-2 before:bg-primary hover:before:bg-primary before:border-4 before:border-secondary
                active:before:scale-100 focus:before:shadow-none hover:before:shadow-none"
            step={1}
            min={1}
            max={20}
            defaultValue={state.params.delta}
            value={state.params.delta}
            tooltip={false}
            onChange={(e) => dispatch(updateParam({ param: 'delta', value: e }))}
          />
        </div>

        <div>
          <span className="text-muted-foreground mr-2 text-sm font-extralight">Zoom</span>
          {state.params.zoom.toFixed(2)}
        </div>
        <div className="bg-secondary rounded-lg">
          <Slider
            className="group mx-4 py-4"
            barClassName="h-0.5 bg-input group-hover:bg-muted-foreground"
            handleClassName="top-[20%]
                before:size-5 before:-ml-2 before:bg-primary hover:before:bg-primary before:border-4 before:border-secondary
                active:before:scale-100 focus:before:shadow-none hover:before:shadow-none"
            min={0.5}
            max={3}
            step={0.05}
            defaultValue={state.params.zoom}
            value={state.params.zoom}
            tooltip={false}
            onChange={(e) => dispatch(updateParam({ param: 'zoom', value: e }))}
          />
        </div>
      </Box>

      <Box className="flex gap-2">
        <Button onClick={() => dispatch(reset())}>
          <ArrowPathRoundedSquareIcon className="size-6 scale-y-[-1] stroke-inherit" />
        </Button>

        <Button className="grow" variant="primary" onClick={() => dispatch(toggleRunning())}>
          {state.running ? (
            <PauseIcon className="stroke-primary-foreground m-auto size-6" />
          ) : (
            <PlayIcon className="stroke-primary-foreground m-auto size-6" />
          )}
        </Button>

        <Button onClick={() => dispatch(step())}>
          <ForwardIcon className="m-auto size-6" />
        </Button>
      </Box>
    </>
  )
}
