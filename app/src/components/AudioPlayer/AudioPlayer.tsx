import React, { useState, useEffect, useCallback } from 'react';
import AudioSlider from '../AudioSlider';
import { audioPlayerManager } from './audioPlayerManager';
import './AudioPlayer.css';

interface AudioPlayerProps {
  trackKey: string;
  onClose: (key: string) => void;
}

/**
 * AudioPlayer component that provides UI controls for audio playback,
 * including play/pause, seeking with crossfade, volume control, looping, and fade effects.
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ trackKey, onClose }) => {
  const [playerManager, setPlayerManager] = useState<audioPlayerManager | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const manager = new audioPlayerManager(
      trackKey,
      setIsPlaying,
      setCurrentTime,
      setDuration
    );
    manager.initialize().then(() => setPlayerManager(manager));

    return () => {
      manager.close();
    };
  }, [trackKey]);

  const handlePlayPause = useCallback(() => {
    playerManager?.togglePlayPause();
  }, [playerManager]);

  const handleSeek = useCallback((time: number) => {
    playerManager?.seek(time);
  }, [playerManager]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    playerManager?.setVolume(newVolume);
  }, [playerManager]);

  const handleToggleLoop = useCallback(() => {
    playerManager?.toggleLoop();
  }, [playerManager]);

  const handleToggleFadeEffect = useCallback(() => {
    playerManager?.toggleFadeEffect();
  }, [playerManager]);

  const handleClose = useCallback(() => {
    playerManager?.close();
    onClose(trackKey);
  }, [playerManager, onClose, trackKey]);

  if (!playerManager) {
    return <div>Loading...</div>;
  }

  return (
    <div className="audio-player">
      <h3>{trackKey}</h3>
      <AudioSlider
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
      />
      <div className="controls">
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={playerManager.getVolume()}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
          />
        </div>
        <button className="play-pause" onClick={handlePlayPause}>
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <div className="right-controls">
          <button
            className={`loop ${playerManager.isLoopActive() ? 'active' : ''}`}
            onClick={handleToggleLoop}
          >
            🔁
          </button>
          <button
            className={`fade ${playerManager.isFadeEffectActive() ? 'active' : ''}`}
            onClick={handleToggleFadeEffect}
          >
            🎚
          </button>
          <button className="close" onClick={handleClose}>
            ✖
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;