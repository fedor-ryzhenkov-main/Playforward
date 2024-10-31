import { Howl } from 'howler';
import { Store } from '@reduxjs/toolkit';
import { updatePlayerState } from './audioSlice';
import { dbg } from 'utils/debug';

export class AudioEngine {
  private audioInstances: Map<string, Howl> = new Map();
  private updateFrameIds: Map<string, number> = new Map();
  private blobUrls: Map<string, string> = new Map(); // Track blob URLs
  private seekingStates: Map<string, boolean> = new Map(); // Track seeking state
  private store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  async loadTrack(trackId: string, audioBuffer: ArrayBuffer): Promise<void> {
    try {
      dbg.audio(`Loading track ${trackId}`);
      
      // Clean up existing instance if any
      this.unloadTrack(trackId);

      const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      this.blobUrls.set(trackId, url);

      const howl = new Howl({
        src: [url],
        format: ['mp3'],
        onload: () => {
          dbg.audio(`Track ${trackId} loaded successfully`);
          this.store.dispatch(updatePlayerState({
            trackId,
            updates: {
              duration: howl.duration(),
              isLoaded: true,
            },
          }));
        },
        onloaderror: (id, error) => {
          dbg.audio(`Error loading track ${trackId}: ${error}`);
          this.cleanupTrack(trackId);
        },
        onend: () => this.handleTrackEnd(trackId),
      });

      this.audioInstances.set(trackId, howl);
    } catch (error) {
      dbg.audio(`Failed to load track ${trackId}: ${error}`);
      this.cleanupTrack(trackId);
      throw error;
    }
  }

  private cleanupTrack(trackId: string): void {
    // Clean up blob URL
    const url = this.blobUrls.get(trackId);
    if (url) {
      URL.revokeObjectURL(url);
      this.blobUrls.delete(trackId);
    }

    // Clean up Howl instance
    const howl = this.audioInstances.get(trackId);
    if (howl) {
      howl.unload();
      this.audioInstances.delete(trackId);
    }

    // Clean up animation frame
    this.cancelUpdatePlaybackState(trackId);
  }

  unloadTrack(trackId: string): void {
    const state = this.store.getState().audio.playerStates[trackId];
    if (state?.isPlaying) {
      const howl = this.audioInstances.get(trackId);
      if (howl) {
        const fadeOutDuration = state.isFadeEffectActive ? 1000 : 150;
        howl.fade(state.volume, 0, fadeOutDuration);
        
        setTimeout(() => {
          this.cleanupTrack(trackId);
        }, fadeOutDuration);
      }
    } else {
      this.cleanupTrack(trackId);
    }
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

    if (howl && howl.playing()) {
      // Only update if not seeking
      if (!this.seekingStates.get(trackId)) {
        this.store.dispatch(updatePlayerState({
          trackId,
          updates: {
            currentTime: howl.seek() as number,
            isPlaying: true,
          },
        }));
      }

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
            updates: { 
              isPlaying: false,
              currentTime: howl.seek() as number 
            },
          }));
          this.cancelUpdatePlaybackState(trackId);
        }, fadeOutDuration);
      } else {
        const fadeInDuration = state.isFadeEffectActive ? 1000 : 200;
        howl.volume(0);
        howl.play();
        howl.fade(0, state.volume, fadeInDuration);
        
        this.store.dispatch(updatePlayerState({
          trackId,
          updates: { isPlaying: true },
        }));
        
        // Start updating playback state
        this.updatePlaybackState(trackId);
      }
    }
  }

  seek(trackId: string, time: number): void {
    const howl = this.audioInstances.get(trackId);
    const state = this.store.getState().audio.playerStates[trackId];
    
    if (howl && state.isLoaded) {
      this.seekingStates.set(trackId, true); // Set seeking state
      
      // Update the state immediately to show the new position
      this.store.dispatch(updatePlayerState({
        trackId,
        updates: { currentTime: time },
      }));

      // Perform the seek
      howl.seek(time);

      // Clear seeking state after a short delay
      setTimeout(() => {
        this.seekingStates.set(trackId, false);
      }, 100); // Small delay to ensure the seek completes
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
}