import { configureStore } from '@reduxjs/toolkit'
import automata from './reducer/automata.js'

export const store = configureStore({
    reducer: {
        automata
    }
})