import { Howl } from 'howler';
import { getTrackFromIndexedDB } from '../../data/storageAudio';

/**
 * Manages audio playback using Howler.js, including play/pause with fade-out to prevent popping,
 * seeking with crossfade, volume control, looping, and fade effects.
 */
export class audioPlayerManager {
  private player: Howl | null = null;
  private isLooping = false;
  private fadeEffect = false;
  private volume = 1;
  private updateFrameId: number | null = null;
  private isSeeking = false;

  constructor(
    private trackKey: string,
    private onPlayStateChange: (isPlaying: boolean) => void,
    private onTimeUpdate: (currentTime: number) => void,
    private onDurationSet: (duration: number) => void
  ) {}

  /**
   * Initializes the audio player by loading the track from IndexedDB.
   */
  async initialize(): Promise<void> {
    const track = await getTrackFromIndexedDB(this.trackKey);
    if (track) {
      const audioBlob = new Blob([track.data], { type: track.type });
      if (audioBlob) {
        this.player = new Howl({
          src: [URL.createObjectURL(audioBlob)],
          format: ['mp3', 'wav'],
          loop: this.isLooping,
          onend: this.handleTrackEnd.bind(this),
          onload: this.handleTrackLoad.bind(this),
        });
      } else {
        console.error('Failed to load audio blob from IndexedDB.');
      }
    } else {
      console.error('Failed to load audio blob from IndexedDB.');
    }
  }

  private handleTrackEnd(): void {
    if (this.isLooping && this.player) {
      // Restart the track if looping is enabled
      this.player.seek(0);
      this.player.play();
      this.onPlayStateChange(true);
      this.updatePlaybackState();
    } else {
      this.onPlayStateChange(false);
      this.cancelUpdatePlaybackState();
    }
  }

  private handleTrackLoad(): void {
    if (this.player) {
      this.onDurationSet(this.player.duration());
    }
  }

  /**
   * Updates the playback state by requesting animation frames.
   */
  updatePlaybackState(): void {
    this.cancelUpdatePlaybackState();
    if (this.player && this.player.playing() && !this.isSeeking) {
      this.onTimeUpdate(this.player.seek() as number);
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
    if (this.player) {
      if (this.player.playing()) {
        // Apply a brief fade-out on pause
        const fadeOutDuration = this.fadeEffect ? 1000 : 200; // Longer fade if fadeEffect is enabled
        this.player.fade(this.volume, 0, fadeOutDuration);
        setTimeout(() => {
          this.player?.pause();
          this.player?.volume(this.volume); // Reset volume back to original
          this.onPlayStateChange(false);
        }, fadeOutDuration);
        this.cancelUpdatePlaybackState();
      } else {
        // Apply fade-in on play
        const fadeInDuration = this.fadeEffect ? 1000 : 200; // Longer fade if fadeEffect is enabled
        this.player.volume(0);
        this.player.play();
        this.player.fade(0, this.volume, fadeInDuration);
        this.onPlayStateChange(true);
        this.updatePlaybackState();
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
        this.onTimeUpdate(time);
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
  }

  /**
   * Toggles the fade effect for play/pause actions.
   */
  toggleFadeEffect(): void {
    this.fadeEffect = !this.fadeEffect;
  }

  /**
   * Closes the audio player, stopping playback and unloading resources.
   */
  close(): void {
    this.cancelUpdatePlaybackState();
    if (this.player) {
      if (this.fadeEffect) {
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

  /**
   * Checks if looping is active.
   *
   * @returns {boolean} True if looping is active, false otherwise.
   */
  isLoopActive(): boolean {
    return this.isLooping;
  }

  /**
   * Checks if the fade effect is active.
   *
   * @returns {boolean} True if the fade effect is active, false otherwise.
   */
  isFadeEffectActive(): boolean {
    return this.fadeEffect;
  }

  /**
   * Gets the current volume level.
   *
   * @returns {number} The current volume level between 0 and 1.
   */
  getVolume(): number {
    return this.volume;
  }
}