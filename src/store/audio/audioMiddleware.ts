import { createListenerMiddleware } from '@reduxjs/toolkit';
import { AudioEngine } from './audioEngine';
import { addActiveTrack, removeActiveTrack } from './audioSlice';
import { Track } from 'data/Track';
import { RootState } from 'store';

// Create middleware first
export const audioMiddleware = createListenerMiddleware();

// Create store instance after middleware is added to the store
let audioEngine: AudioEngine;

// Export a function to initialize the audio engine with the store
export const initializeAudioEngine = (store: any) => {
  audioEngine = new AudioEngine(store);
  return audioEngine;
};

audioMiddleware.startListening({
  actionCreator: addActiveTrack,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const trackId = action.payload;
    const trackMetadata = state.tracks.trackList.find(t => t.id === trackId.id);

    if (trackMetadata) {
      const track = Track.fromSerialized(trackMetadata);
      const audio = await track.getAudio();
      await audioEngine.loadTrack(track.id, audio);
    }
  },
});

audioMiddleware.startListening({
  actionCreator: removeActiveTrack,
  effect: (action) => {
    audioEngine.unloadTrack(action.payload);
  },
});

// Export the audioEngine getter
export const getAudioEngine = () => audioEngine;