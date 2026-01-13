import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { userState } from "../../../types/redux-state-types";


// initial-state
const initialState: userState = {
    isSignedIn: false,
    name: ""
}

// slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        saveUserDetail: (state, action: PayloadAction<userState>)=>{
            state.isSignedIn = action.payload.isSignedIn;
            state.name = action.payload.name
        },
        resetUserDetail: (state)=>{
            state.isSignedIn = initialState.isSignedIn;
            state.name = initialState.name
        }
    }
})

export const { saveUserDetail, resetUserDetail } = userSlice.actions
export default userSlice.reducer