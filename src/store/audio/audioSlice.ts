import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioPlayerState {
  activeTrackIds: string[];
  playerStates: {
    [trackId: string]: {
      name: string;
      isPlaying: boolean;
      currentTime: number;
      duration: number;
      volume: number;
      isLooping: boolean;
      isFadeEffectActive: boolean;
      isLoaded: boolean;
      previousVolume: number | null;
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
    addActiveTrack(state, action: PayloadAction<{ id: string; name: string }>) {
      const { id, name } = action.payload;
      if (!state.activeTrackIds.includes(id)) {
        state.activeTrackIds.push(id);
        state.playerStates[id] = {
          name,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          volume: 1,
          isLooping: false,
          isFadeEffectActive: false,
          isLoaded: false,
          previousVolume: null,
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
    setVolume(state, action: PayloadAction<{ trackId: string; volume: number }>) {
      const playerState = state.playerStates[action.payload.trackId];
      if (playerState) {
        if (action.payload.volume === 0) {
          playerState.previousVolume = playerState.volume;
        }
        playerState.volume = action.payload.volume;
      }
    },
  },
});

export const { addActiveTrack, removeActiveTrack, updatePlayerState, setVolume } = audioSlice.actions;
export default audioSlice.reducer; 