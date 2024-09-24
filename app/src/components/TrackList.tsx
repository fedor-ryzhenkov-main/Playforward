import React, { useState, useEffect } from 'react';
import { getAllAudioKeys } from '../utils/audioStorage';
import AudioPlayer from './AudioPlayer';
import './TrackList.css';

const TrackList: React.FC = () => {
  const [tracks, setTracks] = useState<string[]>([]);
  const [openPlayers, setOpenPlayers] = useState<string[]>([]);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    const keys = await getAllAudioKeys();
    setTracks(keys);
  };

  const handleTrackDoubleClick = (track: string) => {
    if (!openPlayers.includes(track)) {
      setOpenPlayers(prev => [...prev, track]);
    }
  };

  const handleClosePlayer = (track: string) => {
    setOpenPlayers(prev => prev.filter(t => t !== track));
  };

  return (
    <div className="track-list-container">
      <ul className="track-list">
        {tracks.map((track) => (
          <li
            key={track}
            onDoubleClick={() => handleTrackDoubleClick(track)}
            className={openPlayers.includes(track) ? 'selected' : ''}
          >
            {track}
          </li>
        ))}
      </ul>
      {openPlayers.map((track) => (
        <AudioPlayer
          key={track}
          trackKey={track}
          onClose={handleClosePlayer}
        />
      ))}
    </div>
  );
};

export default TrackList;