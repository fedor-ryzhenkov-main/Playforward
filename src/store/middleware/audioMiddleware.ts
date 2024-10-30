import { Middleware } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { 
  updatePlayerState, 
  addPlayer, 
  removePlayer 
} from '../slices/playerSlice';

class AudioManager {
  private audioInstances: Map<string, HTMLAudioElement> = new Map();

  createAudio(trackId: string, trackData: ArrayBuffer) {
    const audio = new Audio();
    audio.src = URL.createObjectURL(new Blob([trackData]));
    this.audioInstances.set(trackId, audio);
    return audio;
  }

  getAudio(trackId: string) {
    return this.audioInstances.get(trackId);
  }

  removeAudio(trackId: string) {
    const audio = this.audioInstances.get(trackId);
    if (audio) {
      audio.pause();
      audio.src = '';
      URL.revokeObjectURL(audio.src);
      this.audioInstances.delete(trackId);
    }
  }
}

const audioManager = new AudioManager();

export const audioMiddleware: Middleware<{}, RootState> = store => next => action => {
  const result = next(action);
  const state = store.getState();

  if (addPlayer.match(action)) {
    const trackId = action.payload;
    const track = state.player.tracks.find(t => t.id === trackId);
    
    if (track) {
      const audio = audioManager.createAudio(trackId, track.data);
      
      audio.addEventListener('timeupdate', () => {
        store.dispatch(updatePlayerState({
          trackId,
          updates: {
            currentTime: audio.currentTime,
          }
        }));
      });

      audio.addEventListener('loadedmetadata', () => {
        store.dispatch(updatePlayerState({
          trackId,
          updates: {
            duration: audio.duration,
          }
        }));
      });

      audio.addEventListener('ended', () => {
        const currentState = store.getState().player.activePlayers[trackId];
        if (currentState?.isLooping) {
          audio.currentTime = 0;
          audio.play();
        } else {
          store.dispatch(updatePlayerState({
            trackId,
            updates: {
              isPlaying: false,
              currentTime: 0,
            }
          }));
        }
      });
    }
  }

  if (removePlayer.match(action)) {
    audioManager.removeAudio(action.payload);
  }

  if (updatePlayerState.match(action)) {
    const { trackId, updates } = action.payload;
    const audio = audioManager.getAudio(trackId);
    
    if (audio) {
      if ('isPlaying' in updates) {
        if (updates.isPlaying) {
          audio.play();
        } else {
          audio.pause();
        }
      }
      
      if ('currentTime' in updates && typeof updates.currentTime === 'number') {
        audio.currentTime = updates.currentTime;
      }
      
      if ('volume' in updates && typeof updates.volume === 'number') {
        audio.volume = updates.volume;
      }

      if ('isFadeEffectActive' in updates && updates.isFadeEffectActive) {
        // Implement fade effect
        const currentVolume = audio.volume;
        const fadeOutDuration = 2000; // 2 seconds
        const fadeInterval = 50; // 50ms intervals
        const steps = fadeOutDuration / fadeInterval;
        const volumeStep = currentVolume / steps;
        
        let currentStep = 0;
        const fadeTimer = setInterval(() => {
          currentStep++;
          const newVolume = currentVolume - (volumeStep * currentStep);
          
          if (newVolume <= 0) {
            clearInterval(fadeTimer);
            audio.volume = 0;
            audio.pause();
            store.dispatch(updatePlayerState({
              trackId,
              updates: {
                isPlaying: false,
                isFadeEffectActive: false,
                volume: currentVolume, // Reset volume for next play
              }
            }));
          } else {
            audio.volume = newVolume;
          }
        }, fadeInterval);
      }
    }
  }

  return result;
};