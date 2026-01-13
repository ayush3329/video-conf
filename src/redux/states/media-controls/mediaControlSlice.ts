import { createSlice } from "@reduxjs/toolkit";
import { mediaState } from "../../../types/redux-state-types";


// initial-state
const initialState: mediaState = {
    camera: false,
    mic: false
}

// slice
const mediaSlice = createSlice({
    name: "media",
    initialState,
    reducers: {
        turnOnCameraAndMic: (state)=>{
            state.camera = true;
            state.mic = true;
        },
        turnOnCamera: (state)=>{
            state.camera = true;
        },
        turnOnMic: (state)=>{
            state.mic = true;
        },
        turnOffCamera: (state)=>{
            state.camera = false;
        },
        turnOffMic: (state)=>{
            state.mic = false;
        }
    }
})

export const { turnOnCameraAndMic, turnOnCamera, turnOnMic, turnOffCamera, turnOffMic } = mediaSlice.actions
export default mediaSlice.reducer