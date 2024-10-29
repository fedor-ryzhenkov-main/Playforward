import React from 'react';
import { AudioPlayerProvider } from 'contexts/AudioPlayerContext';
import { ContextMenuProvider } from 'contexts/ContextMenuContext';
import TrackListController from 'components/lists/track-list/Controller';
import { ModalProvider } from 'contexts/ModalContext';
import './Player.css';

const Player: React.FC = () => {
  return (
    <div className="player-container">
      <main className="app-content">
        <ModalProvider>
          <ContextMenuProvider>
            <AudioPlayerProvider>
              <TrackListController />
            </AudioPlayerProvider>
          </ContextMenuProvider>
        </ModalProvider>
      </main>
    </div>
  );
};

export default Player;