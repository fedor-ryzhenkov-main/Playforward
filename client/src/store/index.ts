import { configureStore } from '@reduxjs/toolkit';
import tracksReducer from './tracks/trackSlice';
import audioReducer from './audio/audioSlice';
import modalReducer from './modal/modalSlice';
import authReducer from './auth/authSlice';
import { audioMiddleware, initializeAudioEngine } from './audio/audioMiddleware';

/**
 * Configures the Redux store with track and playback reducers.
 */
const store = configureStore({
  reducer: {
    tracks: tracksReducer,
    audio: audioReducer,
    modal: modalReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {},
      },
      serializableCheck: false,
    }).prepend(audioMiddleware.middleware),
  devTools: {
    name: 'Playforward',
    trace: true,
    traceLimit: 25
  }
});

// Initialize the audio engine with the store
export const audioEngine = initializeAudioEngine(store);

// Export types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;