import { Howl } from 'howler';
import { Store } from '@reduxjs/toolkit';
import { updatePlayerState } from './audioSlice';

export class AudioEngine {
  private audioInstances: Map<string, Howl> = new Map();
  private updateFrameIds: Map<string, number> = new Map();
  private store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  async loadTrack(trackId: string, audioBuffer: ArrayBuffer): Promise<void> {
    const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    
    const howl = new Howl({
      src: [url],
      format: ['mp3'],
      html5: true,
      onload: () => {
        URL.revokeObjectURL(url);
        this.store.dispatch(updatePlayerState({
          trackId,
          updates: {
            duration: howl.duration(),
            isLoaded: true,
          },
        }));
      },
      onend: () => this.handleTrackEnd(trackId),
    });

    this.audioInstances.set(trackId, howl);
  }

  private handleTrackEnd(trackId: string): void {
    const state = this.store.getState().audio.playerStates[trackId];
    if (state.isLooping) {
      const howl = this.audioInstances.get(trackId);
      if (howl) {
        howl.seek(0);
        howl.play();
        this.updatePlaybackState(trackId);
      }
    } else {
      this.store.dispatch(updatePlayerState({
        trackId,
        updates: { isPlaying: false },
      }));
      this.cancelUpdatePlaybackState(trackId);
    }
  }

  private updatePlaybackState(trackId: string): void {
    this.cancelUpdatePlaybackState(trackId);
    const howl = this.audioInstances.get(trackId);

    if (howl) {
      this.store.dispatch(updatePlayerState({
        trackId,
        updates: { currentTime: howl.seek() as number },
      }));

      const frameId = requestAnimationFrame(() => this.updatePlaybackState(trackId));
      this.updateFrameIds.set(trackId, frameId);
    }
  }

  private cancelUpdatePlaybackState(trackId: string): void {
    const frameId = this.updateFrameIds.get(trackId);
    if (frameId !== undefined) {
      cancelAnimationFrame(frameId);
      this.updateFrameIds.delete(trackId);
    }
  }

  togglePlayPause(trackId: string): void {
    const howl = this.audioInstances.get(trackId);
    const state = this.store.getState().audio.playerStates[trackId];

    if (howl && state.isLoaded) {
      if (howl.playing()) {
        const fadeOutDuration = state.isFadeEffectActive ? 1000 : 200;
        howl.fade(state.volume, 0, fadeOutDuration);
        
        setTimeout(() => {
          howl.pause();
          howl.volume(state.volume);
          this.store.dispatch(updatePlayerState({
            trackId,
            updates: { isPlaying: false },
          }));
        }, fadeOutDuration);
        
        this.cancelUpdatePlaybackState(trackId);
      } else {
        const fadeInDuration = state.isFadeEffectActive ? 1000 : 200;
        howl.volume(0);
        howl.play();
        howl.fade(0, state.volume, fadeInDuration);
        
        this.store.dispatch(updatePlayerState({
          trackId,
          updates: { isPlaying: true },
        }));
        this.updatePlaybackState(trackId);
      }
    }
  }

  seek(trackId: string, time: number): void {
    const howl = this.audioInstances.get(trackId);
    const state = this.store.getState().audio.playerStates[trackId];

    if (howl) {
      const fadeDuration = 150;
      howl.fade(state.volume, 0, fadeDuration);

      setTimeout(() => {
        howl.seek(time);
        howl.fade(0, state.volume, fadeDuration);

        this.store.dispatch(updatePlayerState({
          trackId,
          updates: { currentTime: time },
        }));

        if (howl.playing()) {
          this.updatePlaybackState(trackId);
        }
      }, fadeDuration * 1.1);
    }
  }

  setVolume(trackId: string, volume: number): void {
    const howl = this.audioInstances.get(trackId);
    if (howl) {
      howl.volume(volume);
      this.store.dispatch(updatePlayerState({
        trackId,
        updates: { volume },
      }));
    }
  }

  toggleLoop(trackId: string): void {
    const howl = this.audioInstances.get(trackId);
    const state = this.store.getState().audio.playerStates[trackId];
    
    if (howl) {
      const newLoopState = !state.isLooping;
      howl.loop(newLoopState);
      this.store.dispatch(updatePlayerState({
        trackId,
        updates: { isLooping: newLoopState },
      }));
    }
  }

  toggleFadeEffect(trackId: string): void {
    const state = this.store.getState().audio.playerStates[trackId];
    this.store.dispatch(updatePlayerState({
      trackId,
      updates: { isFadeEffectActive: !state.isFadeEffectActive },
    }));
  }

  unload(trackId: string): void {
    const howl = this.audioInstances.get(trackId);
    const state = this.store.getState().audio.playerStates[trackId];

    if (howl) {
      const fadeOutDuration = state.isFadeEffectActive ? 1000 : 150;
      howl.fade(state.volume, 0, fadeOutDuration);
      
      setTimeout(() => {
        howl.stop();
        howl.unload();
        this.audioInstances.delete(trackId);
      }, fadeOutDuration);
    }
  }
}