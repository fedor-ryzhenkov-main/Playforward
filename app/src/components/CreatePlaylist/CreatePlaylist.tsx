import React, { useState } from 'react';
import PlaylistService from '../../data/services/PlaylistService';
import CreatePlaylistPopup from '../CreatePlaylistPopup/CreatePlaylistPopup';
import './CreatePlaylist.css';

const CreatePlaylist: React.FC = () => {
  const playlistService = new PlaylistService();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCreatePlaylist = async (name: string) => {
    try {
      await playlistService.createPlaylist(name);
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