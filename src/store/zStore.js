import {create} from 'zustand';
import PropTypes from "prop-types";

const initialState = {
    // params: {
    zoom: 1,
    delta: 1,
    tool: 0,
    stamp: 0,
    point: 0,
    erase: 3,
    offset: [0, 0],
    color: '#FAFAFA',
    tray: 10,
    // },
    loop: 0,
    running: false,
    refresh: false,
    set: false
}

const useStore = create((set) => ({
    ...initialState,
    update: () => set(state => ({
        refresh: !state.refresh
    })),
    incLoop: () => set(state => ({
        loop: state.loop++
    })),
    toggleParam: (param) => set(state => ({
        [param]: !state[param]
    })),
    updateParam: (param, value) => set(state => ({
        [param]: value
    })),
    reset: () => set(state => ({
        loop: 0, running: false, set: !state.set
    })),
}));

export default useStore;

useStore.propTypes = {
    update: PropTypes.func,
    incLoop: PropTypes.func,
    toggleRunning: PropTypes.func,
    updateParam: PropTypes.func,
    reset: PropTypes.func,
}
