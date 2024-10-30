import React from 'react';
import { useAppSelector } from 'store/hooks';
import AudioPlayer from 'components/audio/audio-player/Controller';
import './Styles.css';

const AudioPlayers: React.FC = () => {
  const { activePlayers, selectedPlayerId } = useAppSelector(state => state.player);
  
  return (
    <div className="audio-players-container">
      {Object.keys(activePlayers).map(trackId => (
        <AudioPlayer
          key={trackId}
          trackId={trackId}
          isSelected={trackId === selectedPlayerId}
        />
      ))}
    </div>
  );
};

export default AudioPlayers;