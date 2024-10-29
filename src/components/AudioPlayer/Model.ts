import { Howl } from 'howler';
import { AudioPlayerState, AudioPlayerController } from './Interfaces';
import BaseService from '../../data/services/BaseService';
import Track from '../../data/models/Track';

/**
 * Manages audio playback using Howler.js, including play/pause with fade-out to prevent popping,
 * seeking with crossfade, volume control, looping, and fade effects.
 */
class AudioPlayerModel implements AudioPlayerController, AudioPlayerState {
  private player: Howl | null = null;
  private updateFrameId: number | null = null;
  private isSeeking = false;
  private isLoaded = false; // New flag to track loading status

  public isPlaying = false;
  public currentTime = 0;
  public duration = 0;
  public volume = 1;
  public isLooping = false;
  public isFadeEffectActive = false;

  constructor(
    private trackKey: string,
    private onStateUpdate: (state: Partial<AudioPlayerState>) => void,
    private baseService: BaseService
  ) {}

  // Add this method to update the state and notify the controller
  private updateState(state: Partial<AudioPlayerState>): void {
    Object.assign(this, state);
    this.onStateUpdate(state);
  }

  /**
   * Initializes the audio player by loading the track from IndexedDB.
   */
  async initialize(): Promise<void> {
    const track = await this.baseService.getItem(this.trackKey) as Track;
    if (track) {
      const audioBlob = new Blob([track.data], { type: 'audio/mpeg' });
      this.player = new Howl({
        src: [URL.createObjectURL(audioBlob)],
        format: ['mp3', 'wav'],
        loop: this.isLooping,
        onend: this.handleTrackEnd.bind(this),
        onload: this.handleTrackLoad.bind(this),
      });
    } else {
      console.error('Failed to load audio track from repository.');
    }
  }

  private handleTrackEnd(): void {
    if (this.isLooping && this.player) {
      // Restart the track if looping is enabled
      this.player.seek(0);
      this.player.play();
      this.isPlaying = true;
      this.updateState({ isPlaying: this.isPlaying });
      this.updatePlaybackState();
    } else {
      this.isPlaying = false;
      this.updateState({ isPlaying: this.isPlaying });
      this.cancelUpdatePlaybackState();
    }
  }

  private handleTrackLoad(): void {
    if (this.player) {
      this.duration = this.player.duration();
      this.updateState({ duration: this.duration });
      this.isLoaded = true; // Set the flag when loaded
    }
  }

  /**
   * Updates the playback state by requesting animation frames.
   */
  private updatePlaybackState(): void {
    this.cancelUpdatePlaybackState();

    if (this.player && !this.isSeeking) {
      this.currentTime = this.player.seek() as number;
      this.updateState({ currentTime: this.currentTime });
      this.updateFrameId = requestAnimationFrame(this.updatePlaybackState.bind(this));
    }
  }

  private cancelUpdatePlaybackState(): void {
    if (this.updateFrameId !== null) {
      cancelAnimationFrame(this.updateFrameId);
      this.updateFrameId = null;
    }
  }

  /**
   * Toggles between play and pause states, with a brief fade-out on pause to prevent popping sounds.
   */
  togglePlayPause(): void {
    if (!this.isLoaded) {
      console.warn('Audio is still loading, please wait.');
      return;
    }

    if (this.player) {
      if (this.player.playing()) {
        // Pause logic with fade-out
        const fadeOutDuration = this.isFadeEffectActive ? 1000 : 200;
        this.player.fade(this.volume, 0, fadeOutDuration);
        setTimeout(() => {
          this.player?.pause();
          this.player?.volume(this.volume);
          this.updateState({ isPlaying: false });
        }, fadeOutDuration);
        this.cancelUpdatePlaybackState();
      } else {
        // Play logic with fade-in
        const fadeInDuration = this.isFadeEffectActive ? 1000 : 200;
        this.player.volume(0);

        // Start updating playback state after playback starts
        this.player.once('play', () => {
          this.updateState({ isPlaying: true });
          this.updatePlaybackState();
        });

        this.player.play();
        this.player.fade(0, this.volume, fadeInDuration);
      }
    } else {
      console.warn('Player is not initialized.');
    }
  }

  /**
   * Seeks to a specific time in the audio track with a brief crossfade to prevent popping sounds.
   *
   * @param {number} time - The time to seek to in seconds.
   */
  seek(time: number): void {
    if (this.player) {
      this.isSeeking = true;
      this.cancelUpdatePlaybackState();
  
      const fadeDuration = 150; // Fade duration in milliseconds
      const currentVolume = this.volume;
  
      // Fade out the current playback
      this.player.fade(currentVolume, 0, fadeDuration);
  
      setTimeout(() => {
        // Perform the seek
        this.player?.seek(time);
  
        // Fade in the playback
        this.player?.fade(0, currentVolume, fadeDuration);
  
        // Wait for fade-in to complete before resuming playback state updates
        setTimeout(() => {
          this.isSeeking = false;
          if (this.player?.playing()) {
            this.updatePlaybackState();
          }
        }, fadeDuration);
  
        // Update the current time immediately after seeking
        this.currentTime = time;
        this.updateState({ currentTime: this.currentTime });
      }, fadeDuration * 1.1); // Slightly longer to ensure fade-out is complete
    } else {
      console.warn('Player is not initialized.');
    }
  }

  /**
   * Sets the volume of the audio player.
   *
   * @param {number} newVolume - The new volume level between 0 and 1.
   */
  setVolume(newVolume: number): void {
    if (this.player) {
      this.player.volume(newVolume);
      this.volume = newVolume;
      this.updateState({ volume: this.volume });
    }
  }

  /**
   * Toggles looping for the audio track.
   */
  toggleLoop(): void {
    this.isLooping = !this.isLooping;
    if (this.player) {
      this.player.loop(this.isLooping);
    }
    this.updateState({ isLooping: this.isLooping });
  }

  /**
   * Toggles the fade effect for play/pause actions.
   */
  toggleFadeEffect(): void {
    this.isFadeEffectActive = !this.isFadeEffectActive;
    this.updateState({ isFadeEffectActive: this.isFadeEffectActive });
  }

  /**
   * Closes the audio player, stopping playback and unloading resources.
   */
  close(): void {
    this.cancelUpdatePlaybackState();
    if (this.player) {
      if (this.isFadeEffectActive) {
        this.player.fade(this.volume, 0, 100);
        setTimeout(() => {
          this.player?.stop();
          this.player?.unload();
        }, 1000);
      } else {
        // Apply a brief fade-out to prevent popping sounds
        const fadeOutDuration = 150;
        this.player.fade(this.volume, 0, fadeOutDuration);
        setTimeout(() => {
          this.player?.stop();
          this.player?.unload();
        }, fadeOutDuration);
      }
    }
  }
}

export default AudioPlayerModel;