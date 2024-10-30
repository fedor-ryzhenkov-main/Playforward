// app/src/components/AudioPlayer/Controller.tsx
import React, { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { updatePlayerState, removePlayer } from 'store/slices/playerSlice';
import TrackPlayerView from './View';
import { debugLog } from 'utils/debug';

interface AudioPlayerControllerProps {
  trackId: string;
  isSelected?: boolean;
}

const TrackPlayer: React.FC<AudioPlayerControllerProps> = ({ 
  trackId, 
  isSelected = false 
}) => {
  const dispatch = useAppDispatch();
  const playerState = useAppSelector(state => state.player.activePlayers[trackId]);
  const track = useAppSelector(state => 
    state.player.tracks.find(t => t.id === trackId)
  );

  useEffect(() => {
    debugLog('TrackPlayer', 'Mounted', { trackId });
    return () => {
      debugLog('TrackPlayer', 'Unmounted', { trackId });
    };
  }, [trackId]);

  useEffect(() => {
    //debugLog('TrackPlayer', 'State changed', { trackId, playerState });
  }, [playerState, trackId]);

  const handlePlayPause = useCallback(() => {
    if (!playerState) return;
    dispatch(updatePlayerState({
      trackId,
      updates: {
        isPlaying: !playerState.isPlaying
      }
    }));
  }, [dispatch, trackId, playerState]);

  const handleSeek = useCallback((time: number) => {
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
        volume: volume / 100 // Convert from percentage to 0-1 range
      }
    }));
  }, [dispatch, trackId]);

  const handleToggleLoop = useCallback(() => {
    dispatch(updatePlayerState({
      trackId,
      updates: {
        isLooping: !playerState?.isLooping
      }
    }));
  }, [dispatch, trackId, playerState?.isLooping]);

  const handleToggleFadeEffect = useCallback(() => {
    dispatch(updatePlayerState({
      trackId,
      updates: {
        isFadeEffectActive: !playerState?.isFadeEffectActive
      }
    }));
  }, [dispatch, trackId, playerState?.isFadeEffectActive]);

  const handleClose = useCallback(() => {
    dispatch(removePlayer(trackId));
  }, [dispatch, trackId]);

  if (!playerState || !track) return null;

  return (
    <div className={`audio-player-wrapper ${isSelected ? 'selected' : ''}`}>
      <TrackPlayerView
        playerState={{
          ...playerState,
          volume: playerState.volume * 100
        }}
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

export default React.memo(TrackPlayer);