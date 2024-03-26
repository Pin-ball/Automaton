import {PaintBrushIcon, PencilIcon, ViewfinderCircleIcon, PlayIcon, PauseIcon, ForwardIcon} from "@heroicons/react/24/outline/index.js";
import {refresh, reset, toggleParam, toggleRunning, updateParam} from "@src/store/reducer/automata.js";
import { useDispatch, useSelector } from "react-redux";
import { Button, ListButton, Box, Switch } from ".";
import { POINTER, STAMPS } from "@src/Config.js";
import Icon from "@src/icons/LazyIcon.jsx";
import PropTypes from 'prop-types';
import { useState } from "react";
import { Slider } from 'rsuite';

export default function Menu() {
  // console.log('--> Refresh: Menu')
  const dispatch = useDispatch()
  const state = useSelector(store => store.automata)
  const [showMenu, setShowMenu] = useState(true)


  function toggleMenu() {
    setShowMenu(prev => !prev)
  }

  // TODO: Add keyboard control
  // function handleKeyDown(e) {
  //   console.log(e)
  // }

  function changeParam(param, value) {
    dispatch(updateParam({param, value}))
  }

  function chooseStamp (id) {
    dispatch(updateParam({param: 'stamp', value: id}))
    dispatch(updateParam({param: 'tool', value: 2}))
  }

  function chooseErase (id) {
    dispatch(updateParam({param: 'erase', value: id}))
    dispatch(updateParam({param: 'tool', value: 3}))
  }


  return (
    <>
      <Box title={'Tools'}>
        <div className='flex flex-wrap gap-2'>
            <Button
              active={state.params.tool === 0}
              onClick={()=>changeParam('tool', 0)}
            >
              <PencilIcon className='size-6 stroke-inherit'/>
            </Button>

          <ListButton
            active={state.params.tool === 2}
            activeOption={state.params.stamp}
            action={(value) => chooseStamp(value)}
          >
            <ListButton.Button>
                <Icon icon='bolt'/>
            </ListButton.Button>
            <ListButton.Options>
              {STAMPS.map(({id, name}) => (
                <ListButton.Option key={id} value={id}> {name} </ListButton.Option>
              ))}
            </ListButton.Options>
          </ListButton>

          <Button
            active={state.params.tool === 1}
            onClick={()=>changeParam('tool', 1)}
          >
            <PaintBrushIcon className='size-6 stroke-inherit'/>
          </Button>

          <ListButton
            active={state.params.tool === 3}
            activeOption={state.params.erase}
            action={(value) => chooseErase(value)}
          >
            <ListButton.Button>
                <Icon icon='eraser'/>
            </ListButton.Button>
            <ListButton.Options>
              {POINTER.map(({id, name}) => (
                <ListButton.Option key={id} value={id}> {name} </ListButton.Option>
              ))}
            </ListButton.Options>
          </ListButton>

          <Button disabled>
            <ViewfinderCircleIcon className='size-6 stroke-c-neutral-700'/>
          </Button>
        </div>
      </Box>

      <div className='flex gap-2.5'>
        <Box className='w-1/2'>
          <label className='mr-1 font-extralight text-sm text-c-neutral-400'>Iteration</label>
          <p className='text-xl'>{state.loop}</p>
        </Box>
        <Box className='w-1/2'>
          <label className='mr-1 font-extralight text-sm text-c-neutral-400'>Cells</label>
          <p className='text-xl'>{state.cells}</p>
        </Box>
      </div>

      <Box className='grow' title={'Options'}>
        <div className='flex gap-2 flex-col'>
          <Switch
            onClick={() => dispatch(toggleParam({param: 'decay'}))}
            active={state.params.decay}>
            Decay
          </Switch>

          <Switch
            disabled
            onClick={() => dispatch(toggleParam({param: 'center'}))}
            active={state.params.center}>
            Centered
          </Switch>

          <Switch
            disabled
            onClick={() => dispatch(toggleParam({param: 'funky'}))}
            active={false}>
            Funky
          </Switch>
        </div>
      </Box>


      <Box title={'Settings'}>
        <label><span className='mr-1 font-extralight text-sm text-c-neutral-400'>Speed</span> {state.params.delta} /s</label>
        <div className='bg-c-neutral-800 rounded-lg mb-3'>
          <Slider
            className='group py-4 mx-4'
            barClassName='h-0.5 bg-c-neutral-500 group-hover:bg-c-neutral-400'
            handleClassName='top-[20%]
                before:h-5 before:w-5 before:-ml-2 before:bg-c-yellow-500 before:hover:bg-c-yellow-500 before:border-4 before:border-c-neutral-800
                before:active:scale-100 focus:before:shadow-none hover:before:shadow-none'
            step={1}
            min={1}
            max={20}
            defaultValue={state.params.delta}
            value={state.params.delta}
            tooltip={false}
            onChange={(e) => dispatch(updateParam({param: 'delta', value: e}))}
          />
        </div>

        <label><span className='mr-1 font-extralight text-sm text-c-neutral-400'>Zoom</span> {state.params.zoom.toFixed(2)} </label>
        <div className='bg-c-neutral-800 rounded-lg'>
          <Slider
            className='group py-4 mx-4'
            barClassName='h-0.5 bg-c-neutral-500 group-hover:bg-c-neutral-400'
            handleClassName='top-[20%]
                before:size-5 before:-ml-2 before:bg-c-yellow-500 before:hover:bg-c-yellow-500 before:border-4 before:border-c-neutral-800
                before:active:scale-100 focus:before:shadow-none hover:before:shadow-none'
            min={0.5}
            max={3}
            step={0.05}
            defaultValue={state.params.zoom}
            value={state.params.zoom}
            tooltip={false}
            onChange={(e) => dispatch(updateParam({param: 'zoom', value: e}))}
          />
        </div>
      </Box>

      <Box className='flex gap-2'>
        <Button onClick={() => dispatch(reset())}>
          <Icon icon='reset' className='size-5 m-1'/>
        </Button>

        <Button
          className='grow'
          appearance='primary'
          onClick={() => dispatch(toggleRunning())}
        >
          { state.running
            ? <PauseIcon className='size-6 stroke-c-neutral-900 m-auto' />
            : <PlayIcon className='size-6 stroke-c-neutral-900 m-auto' />
          }
        </Button>

        <Button onClick={() => dispatch(refresh())}>
          <ForwardIcon className='size-6 m-auto'/>
        </Button>
      </Box>
    </>
  )
}

Menu.propTypes = {
  appearance: PropTypes.string,
  active: PropTypes.bool,
  action: PropTypes.func,
  children: PropTypes.node
}
