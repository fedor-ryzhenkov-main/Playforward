import { createAsyncThunk } from '@reduxjs/toolkit';
import { Track } from 'data/models/Track';
import { RootState } from 'store';
import { addActiveTrack } from './audioSlice';
import { dbg } from 'utils/debug';

/**
 * Thunk to create a track player.
 * @param trackId - The ID of the track to create a player for.
 */
export const createTrackPlayer = createAsyncThunk<void, string, { state: RootState }>(
  'audio/createTrackPlayer',
  async (trackId, { dispatch, getState }) => {
    const state = getState();
    const trackMetadata = state.tracks.trackList.find(track => track.id === trackId);

    if (!trackMetadata) {
      throw new Error(`Track ${trackId} not found`);
    }

    const track = Track.fromSerialized({ ...trackMetadata, type: 'Track', version: 1 });
    await track.getAudio();
    dispatch(addActiveTrack({ id: trackId, name: trackMetadata.name }));
  }
);