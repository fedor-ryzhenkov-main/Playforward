import React, { useState, useEffect } from 'react';
import { getAllTrackKeys, deleteTrackFromIndexedDB } from '../../data/storageAudio';
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import Track from '../../models/track';

const AudioPlayerList: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    const keys = await getAllTrackKeys();
    setTracks(keys);
  };

  const deleteTrack = async (key: string) => {
    await deleteTrackFromIndexedDB(key);
    await loadTracks();
  };

  return (
    <div>
      <h2>Multi Audio Player</h2>
      {tracks.map((track) => (
        <AudioPlayer key={track.id} trackKey={track.id} onClose={deleteTrack} />
      ))}
    </div>
  );
};

export default AudioPlayerList;