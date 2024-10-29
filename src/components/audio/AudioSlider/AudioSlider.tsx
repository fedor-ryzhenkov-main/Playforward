import React from 'react';

interface AudioSliderProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const AudioSlider: React.FC<AudioSliderProps> = ({ currentTime, duration, onSeek }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    onSeek(newTime);
  };

  return (
    <input
      type="range"
      min="0"
      max={duration}
      value={currentTime}
      onChange={handleChange}
    />
  );
};

export default AudioSlider;