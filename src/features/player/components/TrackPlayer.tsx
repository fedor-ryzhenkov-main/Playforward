// Controller.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { getAudioEngine } from 'store/audio/audioMiddleware';

interface TrackPlayerProps {
  trackId: string;
}

export const TrackPlayer: React.FC<TrackPlayerProps> = ({ trackId }) => {
  const playerState = useSelector((state: RootState) => 
    state.audio.playerStates[trackId]
  );

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(playerState.currentTime);
    }
  }, [playerState.currentTime, isSeeking]);

  const handlePlayPause = useCallback(() => {
    getAudioEngine().togglePlayPause(trackId);
  }, [trackId]);

  const handleSeekStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsSeeking(true);
  }, []);

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSeekValue(value);
  }, []);

  const handleSeekMouseEnd = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const value = parseFloat(e.currentTarget.value);
    getAudioEngine().seek(trackId, value);
    setIsSeeking(false);
  }, [trackId]);

  const handleSeekTouchEnd = useCallback((e: React.TouchEvent<HTMLInputElement>) => {
    const value = parseFloat(e.currentTarget.value);
    getAudioEngine().seek(trackId, value);
    setIsSeeking(false);
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
        value={isSeeking ? seekValue : playerState.currentTime}
        onChange={handleSeekChange}
        onMouseDown={handleSeekStart}
        onMouseUp={handleSeekMouseEnd}
        onTouchStart={handleSeekStart}
        onTouchEnd={handleSeekTouchEnd}
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