import React from 'react';
import TrackListController from 'components/lists/track-list/Controller';
import AudioPlayers from 'components/lists/player-list/Controller';
import { withPageProvider } from 'components/hoc/withPageProvider';
import playerReducer from 'store/slices/playerSlice';
import './Player.css';

const PlayerComponent: React.FC = () => {
  return (
    <div className="player-container">
      <main className="app-content">
        <div className="player-layout">
          <TrackListController />
          <AudioPlayers />
        </div>
      </main>
    </div>
  );
};

// Wrap with page-level store provider
const Player = withPageProvider(PlayerComponent, playerReducer, 'player');
export default Player;