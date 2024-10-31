// Controller.tsx
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { getAudioEngine } from 'store/audioMiddleware';

interface TrackPlayerProps {
  trackId: string;
}

export const TrackPlayer: React.FC<TrackPlayerProps> = ({ trackId }) => {
  const playerState = useSelector((state: RootState) => 
    state.audio.playerStates[trackId]
  );

  const handlePlayPause = useCallback(() => {
    getAudioEngine().togglePlayPause(trackId);
  }, [trackId]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    getAudioEngine().seek(trackId, parseFloat(e.target.value));
  }, [trackId]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    getAudioEngine().setVolume(trackId, parseFloat(e.target.value));
  }, [trackId]);

  const handleToggleLoop = useCallback(() => {
    getAudioEngine().toggleLoop(trackId);
  }, [trackId]);

  const handleToggleFadeEffect = useCallback(() => {
    getAudioEngine().toggleFadeEffect(trackId);
  }, [trackId]);

  if (!playerState) return null;

  return (
    <div className="controller">
      <button onClick={handlePlayPause}>
        {playerState.isPlaying ? 'Pause' : 'Play'}
      </button>

      <input
        type="range"
        min="0"
        max={playerState.duration}
        value={playerState.currentTime}
        onChange={handleSeek}
        step="0.1"
      />

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={playerState.volume}
        onChange={handleVolumeChange}
      />

      <button onClick={handleToggleLoop}>
        {playerState.isLooping ? 'Loop On' : 'Loop Off'}
      </button>

      <button onClick={handleToggleFadeEffect}>
        {playerState.isFadeEffectActive ? 'Fade On' : 'Fade Off'}
      </button>
    </div>
  );
};

export default TrackPlayer;