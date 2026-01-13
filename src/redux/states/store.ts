import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./user/userSlice"
import mediaReducer from "./media-controls/mediaControlSlice"
import { authApiSlice } from '../apis/auth';

export const store = configureStore({
  reducer: {
    user: userReducer,
    media: mediaReducer,

    [authApiSlice.reducerPath]: authApiSlice.reducer
  },
  middleware: (getDefaultMiddleware)=>{
    return getDefaultMiddleware().concat(authApiSlice.middleware)
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;