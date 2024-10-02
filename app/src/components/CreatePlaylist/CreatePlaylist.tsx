import React, { useState } from 'react';
import { savePlaylistToIndexedDB } from '../../data/playlistStorage';
import CreatePlaylistPopup from '../CreatePlaylistPopup/CreatePlaylistPopup';
import './CreatePlaylist.css';

const CreatePlaylist: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCreatePlaylist = async (name: string) => {
    try {
      await savePlaylistToIndexedDB(name);
      console.log('Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  return (
    <div className="create-playlist">
      <button onClick={() => setIsPopupOpen(true)}>
        Create Playlist
      </button>
      {isPopupOpen && (
        <CreatePlaylistPopup
          onClose={() => setIsPopupOpen(false)}
          onCreate={handleCreatePlaylist}
        />
      )}
    </div>
  );
};

export default CreatePlaylist;