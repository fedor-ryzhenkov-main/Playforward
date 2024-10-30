import { Middleware } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { audioManager } from 'services/AudioManager';
import { 
  updatePlayerState, 
  addPlayer, 
  removePlayer 
} from '../slices/playerSlice';
import { debugLog } from 'utils/debug';
import { Track } from 'data/Track';

export const audioMiddleware: Middleware<{}, RootState> = store => next => action => {
  const result = next(action);

  if (addPlayer.match(action)) {
    const trackId = action.payload;
    const state = store.getState();
    const trackData = state.player.tracks.find(t => t.id === trackId);

    if (trackData) {
      const track = Track.fromJSON(trackData);
      track.getAudio().then(audioData => {
        audioManager.createAudio(
          trackId, 
          audioData,
          (audioState) => {
            store.dispatch(updatePlayerState({
              trackId,
              updates: audioState
            }));
          }
        );
      });
    }
  }

  if (updatePlayerState.match(action)) {
    const { trackId, updates } = action.payload;
    const audio = audioManager.getAudio(trackId);
    
    if (audio && !('currentTime' in updates)) {
      if ('isPlaying' in updates) {
        if (updates.isPlaying) {
          audio.play();
          audioManager.startProgressTracking(trackId);
        } else {
          audio.pause();
        }
      }
      if ('volume' in updates && updates.volume !== undefined) {
        audio.volume(updates.volume);
      }
    }
  }

  if (removePlayer.match(action)) {
    audioManager.removeAudio(action.payload);
  }

  return result;
};