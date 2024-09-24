import React from 'react';

interface AudioSliderProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const AudioSlider: React.FC<AudioSliderProps> = ({ currentTime, duration, onSeek }) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={duration}
        value={currentTime}
        onChange={(e) => onSeek(Number(e.target.value))}
        style={{ flex: 1 }}
      />
      <span>{formatTime(duration)}</span>
    </div>
  );
};

export default AudioSlider;