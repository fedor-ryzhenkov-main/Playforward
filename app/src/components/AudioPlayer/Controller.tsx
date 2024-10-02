// app/src/components/AudioPlayer/Controller.tsx
import React, { useState, useEffect } from 'react';
import AudioPlayerModel from './Model';
import AudioPlayerView from './View'; // Ensure this is the correct import
import TrackService from '../../data/services/TrackService';
import { AudioPlayerState } from './Interfaces';

interface AudioPlayerControllerProps {
  trackKey: string;
  service: TrackService;
  onClose: () => void;
}

const AudioPlayerController: React.FC<AudioPlayerControllerProps> = ({ trackKey, service, onClose }) => {
  const [model, setModel] = useState<AudioPlayerModel | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLooping: false,
    isFadeEffectActive: false,
  });

  // Callback passed to the model to handle state updates
  const handleModelUpdates = (state: Partial<AudioPlayerState>) => {
    setPlayerState(prevState => ({
      ...prevState,
      ...state,
    }));
  };

  // Initialize the model when the component mounts
  useEffect(() => {
    const modelInstance = new AudioPlayerModel(trackKey, handleModelUpdates, service);
    setModel(modelInstance);
    modelInstance.initialize();

    // Clean up when the component unmounts
    return () => {
      modelInstance.close();
    };
  }, [trackKey]);

  // Event handlers that call the model's methods
  const handlePlayPause = () => {
    model?.togglePlayPause();
  };

  const handleSeek = (time: number) => {
    model?.seek(time);
  };

  const handleVolumeChange = (volume: number) => {
    model?.setVolume(volume);
  };

  const handleToggleLoop = () => {
    model?.toggleLoop();
  };

  const handleToggleFadeEffect = () => {
    model?.toggleFadeEffect();
  };

  const handleClose = () => {
    model?.close();
    onClose();
  };

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

export default AudioPlayerController;