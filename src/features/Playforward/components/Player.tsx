// Controller.tsx
import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'store'
import { getAudioEngine } from 'store/audio/audioMiddleware'
import { removeActiveTrack, setVolume } from 'store/audio/audioSlice'
import { Stack, Flex, Grid, Button, Text } from 'design-system/components'
import PlayIcon from 'assets/Play.svg'
import PauseIcon from 'assets/Pause.svg'
import VolumeOn from 'assets/VolumeOn.svg'
import VolumeOff from 'assets/VolumeOff.svg'
import Close from 'assets/Close.svg'

interface TrackPlayerProps {
  trackId: string
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const TrackPlayer: React.FC<TrackPlayerProps> = ({ trackId }) => {
  const dispatch = useDispatch()
  const playerState = useSelector((state: RootState) => state.audio.playerStates[trackId])
  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(playerState.currentTime)
    }
  }, [playerState.currentTime, isSeeking])

  const handlePlayPause = useCallback(() => {
    getAudioEngine().togglePlayPause(trackId)
  }, [trackId])

  const handleSeekStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsSeeking(true)
  }, [])

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setSeekValue(value)
  }, [])

  const handleSeekMouseEnd = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const value = parseFloat(e.currentTarget.value)
    getAudioEngine().seek(trackId, value)
    setIsSeeking(false)
  }, [trackId])

  const handleSeekTouchEnd = useCallback((e: React.TouchEvent<HTMLInputElement>) => {
    const value = parseFloat(e.currentTarget.value)
    getAudioEngine().seek(trackId, value)
    setIsSeeking(false)
  }, [trackId])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    getAudioEngine().setVolume(trackId, parseFloat(e.target.value))
  }, [trackId])

  const handleToggleLoop = useCallback(() => {
    getAudioEngine().toggleLoop(trackId)
  }, [trackId])

  const handleToggleFadeEffect = useCallback(() => {
    getAudioEngine().toggleFadeEffect(trackId)
  }, [trackId])

  const handleClose = useCallback(() => {
    getAudioEngine().unloadTrack(trackId)
    dispatch(removeActiveTrack(trackId))
  }, [trackId, dispatch])

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

  return (
    <Stack gap="sm" className="bg-background-secondary rounded-md p-4">
      <Flex justify="between" align="center">
        <Text>{playerState.name}</Text>
        <Text className="text-text-secondary">
          {formatTime(seekValue)} / {formatTime(playerState.duration)}
        </Text>
      </Flex>

      <input
        type="range"
        min={0}
        max={playerState.duration}
        value={seekValue}
        onChange={handleSeekChange}
        onMouseDown={handleSeekStart}
        onMouseUp={handleSeekMouseEnd}
        onTouchStart={handleSeekStart}
        onTouchEnd={handleSeekTouchEnd}
        className="w-full"
      />

      <Grid cols={2} align="center">
        {/* Left Column - Play/Pause */}
        <Flex align="center" gap="sm">
          <Button
            variant="primary"
            shape="circle"
            size="sm"
            onClick={handlePlayPause}
          >
            <img 
              src={playerState.isPlaying ? PauseIcon : PlayIcon} 
              alt={playerState.isPlaying ? "Pause" : "Play"}
              className="w-3 h-3"
            />
          </Button>

          <Flex align="center" gap="sm">
            <Button
              variant="ghost"
              shape="circle"
              size="sm"
              onClick={handleToggleMute}
            >
              <img 
                src={playerState.volume > 0 ? VolumeOn : VolumeOff}
                alt="Volume"
                className="w-3 h-3"
              />
            </Button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={playerState.volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </Flex>
        </Flex>

        {/* Right Column - Other Controls */}
        <Flex justify="end" gap="sm">
          <Button 
            variant="primary"
            shape="circle"
            size="sm"
            onClick={handleToggleLoop}
          >
            <img 
              src={playerState.isLooping ? PauseIcon : PlayIcon}
              alt={playerState.isLooping ? "Loop" : "Unloop"}
              className="w-3 h-3"
            />
          </Button>

          <Button 
            variant="primary"
            shape="circle"
            size="sm"
            onClick={handleToggleFadeEffect}
          >
            <img 
              src={playerState.isFadeEffectActive ? PauseIcon : PlayIcon}
              alt={playerState.isFadeEffectActive ? "Fade" : "No Fade"}
              className="w-3 h-3"
            />
          </Button>

          <Button 
            variant="ghost"
            shape="circle"
            size="sm"
            onClick={handleClose}
          >
            <img 
              src={Close}
              alt="Close"
              className="w-3 h-3"
            />
          </Button>
        </Flex>
      </Grid>
    </Stack>
  )
}

export default TrackPlayer