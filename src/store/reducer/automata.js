import { createSlice } from "@reduxjs/toolkit";

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
        center: false
    },
    loop: 0,
    cells: 0,
    running: false,
    refresh: false,
    reset: false
}

export const automata = createSlice({
    name: 'automata',
    initialState,
    reducers: {
        refresh: (state) => {
            state.refresh = !state.refresh
        },

        incLoop: (state) => {
            state.loop += 1
        },

        toggleRunning: (state) => {
            state.running = !state.running
        },

        toggleParam: (state, action) => {
            const {param} = action.payload
            if (typeof state.params[param] === 'boolean')
                state.params[param] = !state.params[param]
        },

        updateParam: (state, action) => {
            const {param, value} = action.payload
            state.params[param] = value
        },

        cellsCount: (state, action) => {
            const {count} = action.payload
            state.cells = count
        },

        reset: (state) => {
            state.loop = 0
            state.cells = 0
            state.running = false
            state.reset = !state.reset
        }
    }
})


export const {
    refresh,
    incLoop,
    toggleRunning,
    toggleParam,
    updateParam,
    cellsCount,
    reset
} = automata.actions
export default automata.reducer