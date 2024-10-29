import React from 'react';
import AudioSlider from 'components/audio/audio-slider/AudioSlider';
import { AudioPlayerState } from './Interfaces';
import './Styles.css'; 

interface AudioPlayerViewProps {
  playerState: AudioPlayerState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleLoop: () => void;
  onToggleFadeEffect: () => void;
  onClose: () => void;
}

const AudioPlayerView: React.FC<AudioPlayerViewProps> = ({
  playerState,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleLoop,
  onToggleFadeEffect,
  onClose,
}) => {
  const { isPlaying, currentTime, duration, volume, isLooping, isFadeEffectActive } = playerState;

  const isLoaded = duration > 0; // Simple check to see if the audio is loaded

  return (
    <div className="audio-player">
      {!isLoaded && <div className="loading-indicator">Loading...</div>}
      {isLoaded && (
      <><AudioSlider currentTime={currentTime} duration={duration} onSeek={onSeek} /><div className="controls">
          <div className="left-controls">
            <input
              type="range"
              min="0"
              max="1"
              step="0.0005"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="volume-slider" />
          </div>
          <button className="play-pause" onClick={onPlayPause}>
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <div className="right-controls">
            <button
              className={`loop ${isLooping ? 'active' : ''}`}
              onClick={onToggleLoop}
            >
              🔁
            </button>
            <button
              className={`fade ${isFadeEffectActive ? 'active' : ''}`}
              onClick={onToggleFadeEffect}
            >
              🎚
            </button>
            <button className="close" onClick={onClose}>
              ✖
            </button>
          </div>
        </div>
      </>
      )}
    </div>
  );
};

export default AudioPlayerView;