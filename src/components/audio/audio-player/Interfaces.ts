/**
 * Represents the state of an audio player.
 */
export interface AudioPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isLooping: boolean;
    isFadeEffectActive: boolean;
  }
  
  /**
   * Defines the methods for controlling an audio player.
   */
  export interface AudioPlayerController {
    initialize(): Promise<void>;
    togglePlayPause(): void;
    seek(time: number): void;
    setVolume(volume: number): void;
    toggleLoop(): void;
    toggleFadeEffect(): void;
    close(): void;
  }
  
  /**
   * Defines the methods for updating the audio player view.
   */
  export interface AudioPlayerView {
    updatePlayState(isPlaying: boolean): void;
    updateTime(currentTime: number): void;
    updateDuration(duration: number): void;
    updateVolume(volume: number): void;
    updateLoopState(isLooping: boolean): void;
    updateFadeEffectState(isFadeEffectActive: boolean): void;
  }