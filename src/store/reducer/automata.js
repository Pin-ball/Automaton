import { createSelector, createSlice, original } from '@reduxjs/toolkit'
import { editCells, nextGeneration } from '@src/utils/life.js'

const initialState = {
  params: {
    zoom: 1,
    delta: 1,
    tool: 0,
    stamp: 0,
    point: 0,
    erase: 3,
    offset: [0, 0],
    color: '#FAFAFA',
    tray: 20,
    decay: true,
    center: false,
  },
  cells: {},
  loop: 0,
  running: false,
}

export const automata = createSlice({
  name: 'automata',
  initialState,
  reducers: {
    step: (state) => {
      state.cells = nextGeneration(original(state.cells), state.params)
      state.loop += 1
    },

    applyTool: (state, action) => {
      const { cell, previousCell } = action.payload
      editCells(state.cells, state.params, cell, previousCell)
    },

    toggleRunning: (state) => {
      state.running = !state.running
    },

    toggleParam: (state, action) => {
      const { param } = action.payload
      if (typeof state.params[param] === 'boolean') state.params[param] = !state.params[param]
    },

    updateParam: (state, action) => {
      const { param, value } = action.payload
      state.params[param] = value
    },

    reset: (state) => {
      state.cells = {}
      state.loop = 0
      state.running = false
    },
  },
})

export const selectPopulation = createSelector(
  [(store) => store.automata.cells],
  (cells) => Object.values(cells).filter((value) => value >= 1).length,
)

export const { step, applyTool, toggleRunning, toggleParam, updateParam, reset } = automata.actions
export default automata.reducer
