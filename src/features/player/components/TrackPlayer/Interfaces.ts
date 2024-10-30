/**
 * Represents the state of an audio player.
 */
export interface TrackPlayerState {
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
  export interface TrackPlayer {
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
  export interface TrackPlayerViewProps {
    playerState: TrackPlayerState;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onVolumeChange: (volume: number) => void;
    onToggleLoop: () => void;
    onToggleFadeEffect: () => void;
    onClose: () => void;
  }