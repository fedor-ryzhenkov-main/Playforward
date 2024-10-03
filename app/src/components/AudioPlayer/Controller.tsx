// app/src/components/AudioPlayer/Controller.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import AudioPlayerView from './View';
import AudioPlayerModel from './Model';
import { AudioPlayerState } from './Interfaces';
import BaseService from '../../data/services/BaseService';

interface AudioPlayerControllerProps {
  trackId: string;
  onClose: () => void;
}

const AudioPlayerController: React.FC<AudioPlayerControllerProps> = ({ trackId, onClose }) => {
  const [model, setModel] = useState<AudioPlayerModel | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLooping: false,
    isFadeEffectActive: false,
  });

  const baseService = useRef(new BaseService()).current;

  const handleModelUpdates = useCallback((state: Partial<AudioPlayerState>) => {
    setPlayerState(prevState => ({
      ...prevState,
      ...state,
    }));
  }, []);

  useEffect(() => {
    const modelInstance = new AudioPlayerModel(trackId, handleModelUpdates, baseService);
    setModel(modelInstance);
    modelInstance.initialize();

    return () => {
      modelInstance.close();
    };
  }, [trackId, handleModelUpdates, baseService]);

  const handlePlayPause = useCallback(() => model?.togglePlayPause(), [model]);
  const handleSeek = useCallback((time: number) => model?.seek(time), [model]);
  const handleVolumeChange = useCallback((volume: number) => model?.setVolume(volume), [model]);
  const handleToggleLoop = useCallback(() => model?.toggleLoop(), [model]);
  const handleToggleFadeEffect = useCallback(() => model?.toggleFadeEffect(), [model]);
  const handleClose = useCallback(() => {
    model?.close();
    onClose();
  }, [model, onClose]);

  return (
    <AudioPlayerView
      playerState={playerState}
      onPlayPause={handlePlayPause}
      onSeek={handleSeek}
      onVolumeChange={handleVolumeChange}
      onToggleLoop={handleToggleLoop}
      onToggleFadeEffect={handleToggleFadeEffect}
      onClose={handleClose}
    />
  );
};

export default React.memo(AudioPlayerController);