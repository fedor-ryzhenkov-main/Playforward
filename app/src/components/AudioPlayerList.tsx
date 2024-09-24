import React, { useState, useEffect } from 'react';
import { getAllAudioKeys, deleteAudioFromIndexedDB } from '../utils/audioStorage';
import AudioPlayer from './AudioPlayer';

const AudioPlayerList: React.FC = () => {
  const [tracks, setTracks] = useState<string[]>([]);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    const keys = await getAllAudioKeys();
    setTracks(keys);
  };

  const deleteTrack = async (key: string) => {
    await deleteAudioFromIndexedDB(key);
    await loadTracks();
  };

  return (
    <div>
      <h2>Multi Audio Player</h2>
      {tracks.map((track) => (
        <AudioPlayer key={track} trackKey={track} onClose={deleteTrack} />
      ))}
    </div>
  );
};

export default AudioPlayerList;