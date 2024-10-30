import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { 
  setTracks, 
  setAllTags, 
  setLoading, 
  setError,
  addPlayer,
  removePlayer,
  updatePlayerState,
} from '../slices/playerSlice';
import { Track } from 'data/Track';
import { TrackRepository } from 'data/TrackRepository';

const repository = new TrackRepository();

export const loadTracks = createAsyncThunk<
  void,
  { searchName?: string; searchTags?: string } | void,
  { state: RootState }
>(
  'player/loadTracks',
  async (searchParams, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      let tracks: Track[];

      if (searchParams?.searchName) {
        tracks = await repository.searchByName(searchParams.searchName);
      } else if (searchParams?.searchTags) {
        const tags = searchParams.searchTags.split(',')
          .map(tag => tag.trim())
          .filter(Boolean);
        
        if (tags.length === 0) {
          tracks = await repository.getAll();
        } else {
          const tracksByTag = await Promise.all(
            tags.map(tag => repository.searchByTag(tag))
          );
          const trackMap = new Map(
            tracksByTag.flat().map(track => [track.id, track])
          );
          tracks = Array.from(trackMap.values());
        }
      } else {
        tracks = await repository.getAll();
      }

      const sortedTracks = [...tracks].sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      const allTags = Array.from(new Set(
        tracks.flatMap(track => track.tags)
      )).sort();

      dispatch(setTracks(sortedTracks.map(track => track.toJSON())));
      dispatch(setAllTags(allTags));
      dispatch(setError(null));
    } catch (error) {
      dispatch(setError('Failed to load tracks'));
      console.error('Load tracks error:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Play or stop a track
export const playTrack = createAsyncThunk<void, Track, { state: RootState }>(
  'player/playTrack',
  async (track, { dispatch, getState }) => {
    try {
      const state = getState();
      const isPlaying = state.player.activePlayers[track.id]?.isPlaying;
      
      if (isPlaying) {
        dispatch(updatePlayerState({
          trackId: track.id,
          updates: { isPlaying: false }
        }));
      } else {
        // Only get audio and create player if it doesn't exist
        if (!state.player.activePlayers[track.id]) {
          await track.getAudio();
          dispatch(addPlayer(track.id));
        } else {
          dispatch(updatePlayerState({
            trackId: track.id,
            updates: { isPlaying: true }
          }));
        }
      }
    } catch (error) {
      console.error('[playTrack] Error:', error);
      dispatch(setError('Failed to play track'));
    }
  }
);

// Upload a new track
export const uploadTrack = createAsyncThunk<void, File, { state: RootState }>(
  'player/uploadTrack',
  async (file, { dispatch }) => {
    try {
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      const track = Track.create(fileName);
      const audio = await file.arrayBuffer();
      
      await repository.add(track, audio);
      dispatch(loadTracks()); // Reload all tracks after upload
    } catch (error) {
      dispatch(setError('Failed to upload track'));
      console.error('Upload track error:', error);
      throw error;
    }
  }
);

// Play the selected track from the list
export const playSelectedTrack = createAsyncThunk<void, void, { state: RootState }>(
  'player/playSelectedTrack',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const { tracks, selectedTrackIndex } = state.player;
      
      console.log('Playing selected track:', { selectedTrackIndex, tracksLength: tracks.length });
      
      if (selectedTrackIndex >= 0 && selectedTrackIndex < tracks.length) {
        const selectedTrackData = tracks[selectedTrackIndex];
        console.log('Selected track data:', selectedTrackData);
        
        const track = Track.fromJSON(selectedTrackData);
        const fullTrack = await repository.getTrack(track.id);
        
        console.log('Full track loaded:', fullTrack?.id);
        
        if (fullTrack) {
          await dispatch(playTrack(fullTrack));
        }
      }
    } catch (error) {
      console.error('Play selected track error:', error);
      dispatch(setError('Failed to play selected track'));
    }
  }
);