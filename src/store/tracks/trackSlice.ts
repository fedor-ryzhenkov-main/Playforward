import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrackMetadata } from 'data/Track';
import { loadTracksAsync } from 'store/tracks/trackThunks';

interface TrackState {
  trackList: TrackMetadata[];
  loading: boolean;
  error: string | null;
}

/**
 * Slice for managing track data.
 */
const initialState: TrackState = {
  trackList: [],
  loading: false,
  error: null,
};

const trackSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    /**
     * Sets the list of tracks.
     * @param state - The current state.
     * @param action - The action payload containing an array of track metadata.
     */
    setTracks(state, action: PayloadAction<TrackMetadata[]>) {
      state.trackList = action.payload;
    },
    /**
     * Adds a new track to the list.
     * @param state - The current state.
     * @param action - The action payload containing the new track metadata.
     */
    addTrack(state, action: PayloadAction<TrackMetadata>) {
      state.trackList.push(action.payload);
    },
    // Additional track-related reducers can be added here
  },
  extraReducers: builder => {
    builder
      .addCase(loadTracksAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTracksAsync.fulfilled, state => {
        state.loading = false;
      })
      .addCase(loadTracksAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load tracks';
      });
  },
});

export const { setTracks, addTrack } = trackSlice.actions;
export default trackSlice.reducer;