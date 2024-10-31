import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioPlayerState {
  activeTrackIds: string[];
  playerStates: {
    [trackId: string]: {
      isPlaying: boolean;
      currentTime: number;
      duration: number;
      volume: number;
      isLooping: boolean;
      isFadeEffectActive: boolean;
      isLoaded: boolean;
    };
  };
}

const initialState: AudioPlayerState = {
  activeTrackIds: [],
  playerStates: {},
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    addActiveTrack(state, action: PayloadAction<string>) {
      if (!state.activeTrackIds.includes(action.payload)) {
        state.activeTrackIds.push(action.payload);
        state.playerStates[action.payload] = {
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          volume: 1,
          isLooping: false,
          isFadeEffectActive: false,
          isLoaded: false,
        };
      }
    },
    removeActiveTrack(state, action: PayloadAction<string>) {
      state.activeTrackIds = state.activeTrackIds.filter(id => id !== action.payload);
      delete state.playerStates[action.payload];
    },
    updatePlayerState(
      state,
      action: PayloadAction<{
        trackId: string;
        updates: Partial<AudioPlayerState['playerStates'][string]>;
      }>
    ) {
      const { trackId, updates } = action.payload;
      if (state.playerStates[trackId]) {
        state.playerStates[trackId] = {
          ...state.playerStates[trackId],
          ...updates,
        };
      }
    },
  },
});

export const { addActiveTrack, removeActiveTrack, updatePlayerState } = audioSlice.actions;
export default audioSlice.reducer; 