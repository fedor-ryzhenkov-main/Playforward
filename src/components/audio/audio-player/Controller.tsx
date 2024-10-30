// app/src/components/AudioPlayer/Controller.tsx
import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { updatePlayerState, removePlayer } from 'store/slices/playerSlice';
import AudioPlayerView from './View';
import './Styles.css';

interface AudioPlayerControllerProps {
  trackId: string;
  isSelected?: boolean;
}

const AudioPlayerController: React.FC<AudioPlayerControllerProps> = ({ 
  trackId, 
  isSelected = false 
}) => {
  const dispatch = useAppDispatch();
  const playerState = useAppSelector(state => state.player.activePlayers[trackId]);
  const track = useAppSelector(state => 
    state.player.tracks.find(t => t.id === trackId)
  );

  const handlePlayPause = useCallback(() => {
    if (!playerState) return;
    dispatch(updatePlayerState({
      trackId,
      updates: {
        isPlaying: !playerState.isPlaying
      }
    }));
  }, [dispatch, trackId, playerState?.isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (!playerState) return;
    dispatch(updatePlayerState({
      trackId,
      updates: {
        currentTime: time
      }
    }));
  }, [dispatch, trackId]);

  const handleVolumeChange = useCallback((volume: number) => {
    dispatch(updatePlayerState({
      trackId,
      updates: {
        volume
      }
    }));
  }, [dispatch, trackId]);

  const handleToggleLoop = useCallback(() => {
    dispatch(updatePlayerState({
      trackId,
      updates: {
        isLooping: !playerState.isLooping
      }
    }));
  }, [dispatch, trackId, playerState.isLooping]);

  const handleToggleFadeEffect = useCallback(() => {
    dispatch(updatePlayerState({
      trackId,
      updates: {
        isFadeEffectActive: !playerState.isFadeEffectActive
      }
    }));
  }, [dispatch, trackId, playerState.isFadeEffectActive]);

  const handleClose = useCallback(() => {
    dispatch(removePlayer(trackId));
  }, [dispatch, trackId]);

  if (!playerState || !track) return null;

  return (
    <div className={`audio-player-wrapper ${isSelected ? 'selected' : ''}`}>
      <AudioPlayerView
        playerState={playerState}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleLoop={handleToggleLoop}
        onToggleFadeEffect={handleToggleFadeEffect}
        onClose={handleClose}
      />
    </div>
  );
};

export default React.memo(AudioPlayerController);