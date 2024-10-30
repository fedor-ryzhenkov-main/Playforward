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
import BaseService from 'data/services/BaseService';
import Track from 'data/models/Track';
import { createTrack } from 'data/models/Track';

const baseService = new BaseService();

export const loadTracks = createAsyncThunk<
  void,
  { searchName: string; searchTags: string },
  { state: RootState }
>(
  'player/loadTracks',
  async ({ searchName, searchTags }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      // Get all tracks from service
      const tracks = await baseService.getAllTracks();
      
      // Filter tracks based on search criteria
      const searchTagsSet = searchTags ? 
        new Set(searchTags.split(',').map(tag => tag.trim()).filter(tag => tag)) : 
        new Set<string>();

      const filteredTracks = tracks.filter(track => {
        if (searchName && !track.name.toLowerCase().includes(searchName.toLowerCase())) {
          return false;
        }
        if (searchTagsSet.size > 0) {
          return Array.from(searchTagsSet).every(searchTag =>
            track.tags.includes(searchTag)
          );
        }
        return true;
      });

      // Sort tracks alphabetically
      const sortedTracks = [...filteredTracks].sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      // Extract unique tags from all tracks (not just filtered ones)
      const allTags = Array.from(new Set(
        tracks.flatMap(track => track.tags)
      )).sort();

      dispatch(setTracks(sortedTracks));
      dispatch(setAllTags(allTags));
      dispatch(setError(null));
    } catch (error) {
      dispatch(setError('Failed to load tracks'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const playTrack = createAsyncThunk<
  void,
  Track,
  { state: RootState }
>(
  'player/playTrack',
  async (track, { dispatch, getState }) => {
    try {
      const state = getState() as RootState;
      const isPlaying = state.player.activePlayers[track.id]?.isPlaying;

      if (isPlaying) {
        dispatch(removePlayer(track.id));
      } else {
        dispatch(addPlayer(track.id));
        const audio = new Audio();
        audio.src = URL.createObjectURL(new Blob([track.data]));
        
        audio.addEventListener('timeupdate', () => {
          dispatch(updatePlayerState({
            trackId: track.id,
            updates: {
              currentTime: audio.currentTime,
            },
          }));
        });

        audio.addEventListener('loadedmetadata', () => {
          dispatch(updatePlayerState({
            trackId: track.id,
            updates: {
              duration: audio.duration,
            },
          }));
        });

        await audio.play();
        
        dispatch(updatePlayerState({
          trackId: track.id,
          updates: {
            isPlaying: true,
          },
        }));
      }
    } catch (error) {
      dispatch(setError('Failed to play track'));
    }
  }
);

export const uploadTrack = createAsyncThunk<
  void,
  File,
  { state: RootState }
>(
  'player/uploadTrack',
  async (file, { dispatch, getState }) => {
    try {
      const track = createTrack(
        file.name.replace(/\.[^/.]+$/, ''),
        await file.arrayBuffer()
      );
      
      await baseService.addTrack(track);
      
      // Reload tracks with current search criteria
      const state = getState();
      dispatch(loadTracks({
        searchName: state.player.searchName,
        searchTags: state.player.searchTags
      }));
    } catch (error) {
      dispatch(setError('Failed to upload track'));
      throw error;
    }
  }
);

export const playSelectedTrack = createAsyncThunk<
  void,
  void,
  { state: RootState }
>(
  'player/playSelectedTrack',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const { tracks, selectedTrackIndex } = state.player;
    
    if (selectedTrackIndex >= 0 && selectedTrackIndex < tracks.length) {
      await dispatch(playTrack(tracks[selectedTrackIndex]));
    }
  }
); 