import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Box, Flex, Button, Text } from 'design-system/components';
import { formatTime } from 'features/player/utils/formatTime';
import { TrackPlayerState } from './Interfaces';

const SliderInput = styled.input<{ percentage: number }>`
  width: 100%;
  height: 4px;
  appearance: none;
  background: ${({ theme, percentage }) => `linear-gradient(to right, 
    ${theme.colors.main} 0%, 
    ${theme.colors.main} ${percentage}%, 
    ${theme.colors.background.accent} ${percentage}%, 
    ${theme.colors.background.accent} 100%)`};
  border-radius: 2px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background-color: ${({ theme }) => theme.colors.main};
    border: none;
    border-radius: 50%;
    transition: transform 0.1s;

    &:hover {
      transform: scale(1.2);
    }
  }
`;

const CircleButton = styled(Button)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: ${({ theme }) => theme.typography.fontSize.xl}px;
  background-color: ${({ theme }) => theme.colors.main};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    transform: scale(1.05);
    background-color: ${({ theme }) => theme.colors.main};
    opacity: 0.9;
  }
`;

const CustomSlider: React.FC<{
  value: number;
  max: number;
  onChange: (value: number) => void;
  type?: 'time' | 'volume';
}> = ({ value, max, onChange, type = 'time' }) => {
  const percentage = (value / max) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <Box position="relative" width="100%">
      <SliderInput
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={handleChange}
        percentage={percentage}
      />
      {type === 'time' && (
        <Flex justifyContent="space-between" mt={1}>
          <Text variant="caption" color="text.secondary">
            {formatTime(value)}
          </Text>
          <Text variant="caption" color="text.secondary">
            {formatTime(max)}
          </Text>
        </Flex>
      )}
    </Box>
  );
};

interface TrackPlayerViewProps {
  playerState: TrackPlayerState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleLoop: () => void;
  onToggleFadeEffect: () => void;
  onClose: () => void;
}

const TrackPlayerView: React.FC<TrackPlayerViewProps> = ({
  playerState,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleLoop,
  onToggleFadeEffect,
  onClose,
}) => {
  const { isPlaying, currentTime, duration, volume, isLooping, isFadeEffectActive } = playerState;
  const isLoaded = duration > 0;

  return (
    <Box p="lg" bg="background.secondary" borderRadius={8} width="100%" maxWidth="480px">
      {!isLoaded ? (
        <Flex justifyContent="center" alignItems="center" height="120px">
          <Text variant="body" color="text.secondary">
            Loading...
          </Text>
        </Flex>
      ) : (
        <Flex flexDirection="column" gap="md">
          {/* Track Progress */}
          <Box mb="lg">
            <CustomSlider
              value={currentTime}
              max={duration}
              onChange={onSeek}
              type="time"
            />
          </Box>

          <Flex flexDirection="row" justifyContent="space-between">

          {/* Volume Control */}
          <Flex alignItems="center" gap={2} mb="lg">
            <Box as="span" color="text.secondary">
              🔊
            </Box>
            <Box width="120px">
              <CustomSlider
                value={volume}
                max={100}
                onChange={onVolumeChange}
                type="volume"
              />
            </Box>
          </Flex>
        
            {/* Play/Pause Button */}
            <CircleButton
              variant="ghost"
              size="large"
              onClick={onPlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '❚❚' : '▶'}
            </CircleButton>

            {/* Secondary Controls */}
            <Flex alignItems="center" gap={3}>
              <Button
                variant="ghost"
                size="small"
                onClick={onToggleLoop}
                aria-label="Toggle Loop"
                color={isLooping ? 'text.accent' : 'text.primary'}
              >
                🔁
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={onToggleFadeEffect}
                aria-label="Toggle Fade Effect"
                color={isFadeEffectActive ? 'text.accent' : 'text.primary'}
              >
                🎚
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={onClose}
                aria-label="Close"
              >
                ✖
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default TrackPlayerView;