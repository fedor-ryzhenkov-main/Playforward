// Controller.tsx
import { Box, Button, Flex, Grid, Text } from 'design-system/components';
import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { getAudioEngine } from 'store/audio/audioMiddleware';
import { removeActiveTrack } from 'store/audio/audioSlice';
import PlayIcon from 'assets/Play.svg';
import PauseIcon from 'assets/Pause.svg';
import VolumeOn from 'assets/VolumeOn.svg';
import VolumeOff from 'assets/VolumeOff.svg';
import Close from 'assets/Close.svg';
import { setVolume } from 'store/audio/audioSlice';

interface TrackPlayerProps {
  trackId: string;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const TrackPlayer: React.FC<TrackPlayerProps> = ({ trackId }) => {
  const dispatch = useDispatch();
  
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

  const handleClose = useCallback(() => {
    getAudioEngine().unloadTrack(trackId);
    dispatch(removeActiveTrack(trackId));
  }, [trackId, dispatch]);

  const handleToggleMute = useCallback(() => {
    const audioEngine = getAudioEngine();
    if (playerState.volume > 0) {
      dispatch(setVolume({ trackId, volume: 0 }));
      audioEngine.setVolume(trackId, 0);
    } else {
      const volumeToRestore = playerState.previousVolume || 1;
      dispatch(setVolume({ trackId, volume: volumeToRestore }));
      audioEngine.setVolume(trackId, volumeToRestore);
    }
  }, [trackId, playerState.volume, playerState.previousVolume, dispatch]);

  if (!playerState) return null;

  return (
    <Box bg="background.secondary" p={3} borderRadius="8px">
      <Flex variants={['column']} gap="md">
        {/* Track Title */}
        <Text variants={['subtitle']} textAlign="center">
          {playerState.name}
        </Text>

        {/* Track Progress Section */}
        <Flex alignItems="center" gap="sm">
          {/* Current Time */}
          <Text variants={['caption']}>
            {formatTime(playerState.currentTime)}
          </Text>

          {/* Track Progress Slider */}
          <Box flex="1">
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
              style={{ width: '100%' }}
            />
          </Box>

          {/* Total Duration */}
          <Text variants={['caption']}>
            {formatTime(playerState.duration)}
          </Text>
        </Flex>

        {/* Controls Grid */}
        <Grid
          gridTemplateColumns="1fr auto 1fr"
          gap="md"
          alignItems="center"
        >
          {/* Left Column - Volume */}
          <Flex style={{ gap: '8px', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Button
              variants={['primary', 'circle', 'small']}
              onClick={handleToggleMute}
            >
              <img
                src={playerState.volume > 0 ? VolumeOn : VolumeOff}
                alt={playerState.volume > 0 ? "Mute" : "Unmute"}
                width="12"
                height="12"
                style={{
                  display: 'block',
                  margin: 'auto',
                }}
              />
            </Button>
            <Box flex="1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={playerState.volume}
                onChange={handleVolumeChange}
                style={{ width: '100%' }}
              />
            </Box>
          </Flex>

          {/* Middle Column - Play/Pause */}
          <Box>
            <Button 
              variants={['primary', 'circle', 'medium']} 
              onClick={handlePlayPause}
            >
              <img 
                src={playerState.isPlaying ? PauseIcon : PlayIcon} 
                alt={playerState.isPlaying ? "Pause" : "Play"}
                width="12"
                height="12"
                style={{
                  display: 'block',
                  margin: 'auto',
                }}
              />
            </Button>
          </Box>

          {/* Right Column - Other Controls */}
          <Flex style={{ justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              <Button 
                variants={['primary', 'circle', 'small']} 
                onClick={handleToggleLoop}
              >
                <img 
                src={playerState.isLooping ? PauseIcon : PlayIcon} 
                alt={playerState.isLooping ? "Loop" : "Unloop"}
                width="12"
                height="12"
                style={{
                  display: 'block',
                  margin: 'auto',
                }}
              />
              </Button>

              <Button 
                variants={['primary', 'circle', 'small']} 
                onClick={handleToggleFadeEffect}
              >
                <img 
                src={playerState.isFadeEffectActive ? PauseIcon : PlayIcon} 
                alt={playerState.isFadeEffectActive ? "Pause" : "Play"}
                width="12"
                height="12"
                style={{
                  display: 'block',
                  margin: 'auto',
                }}
              />
              </Button>

              <Button 
                variants={['primary', 'circle', 'small']} 
                onClick={handleClose}
              >
                <img 
                src={Close} 
                alt="Close"
                width="12"
                height="12"
                style={{
                  display: 'block',
                  margin: 'auto',
                }}
              />
              </Button>
          </Flex>
        </Grid>
      </Flex>
    </Box>
  );
};

export default TrackPlayer;