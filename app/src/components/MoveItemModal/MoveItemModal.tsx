import React, { useState, useEffect } from 'react';
import './MoveItemModal.css';
import Track from '../../data/models/Track';
import Playlist from '../../data/models/Playlist';
import PlaylistService from '../../data/services/PlaylistService';
import TrackService from '../../data/services/TrackService';

interface MoveItemModalProps {
  item: Track | Playlist;
  onClose: () => void;
  onMove: () => void;
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({ item, onClose, onMove }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const playlistService = new PlaylistService();
  const trackService = new TrackService();

  useEffect(() => {
    const loadPlaylists = async () => {
      const allPlaylists = await playlistService.getAllPlaylists();
      setPlaylists(allPlaylists);
      setFilteredPlaylists(allPlaylists);
    };
    loadPlaylists();
  }, [playlistService]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlaylists(playlists);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = playlists.filter((playlist) =>
        playlist.name.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredPlaylists(filtered);
    }
  }, [searchTerm, playlists]);

  const handleMove = async (playlistId?: string) => {
    try {
      item.parentId = playlistId;

      if (isTrack(item)) {
        await trackService.updateTrack(item);
      } else if (isPlaylist(item)) {
        await playlistService.updatePlaylist(item);
      }

      onMove(); // Notify parent component to refresh if needed
    } catch (error) {
      console.error('Error moving item:', error);
      alert('Failed to move item.');
    }
  };

  // Type guard to check if item is a Track
  function isTrack(item: any): item is Track {
    return (item as Track).data !== undefined; // Replace with an actual property unique to Track
  }

  // Type guard to check if item is a Playlist
  function isPlaylist(item: any): item is Playlist {
    return (item as Playlist).items !== undefined;
  }

  const renderPlaylistTree = (playlists: Playlist[], parentId?: string, path: string = '') => {
    return playlists
      .filter((playlist) => playlist.parentId === parentId)
      .map((playlist) => {
        const fullPath = path ? `${path} / ${playlist.name}` : playlist.name;
        return (
          <div key={playlist.id} className="playlist-item">
            <div
              className="playlist-path"
              onClick={() => handleMove(playlist.id)}
            >
              {fullPath}
            </div>
            <div className="playlist-children">
              {renderPlaylistTree(playlists, playlist.id, fullPath)}
            </div>
          </div>
        );
      });
  };

  return (
    <div className="modal-overlay">
      <div className="move-track-modal">
        <h2>Move Track to Playlist</h2>
        <input
          type="text"
          placeholder="Search Playlists"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="playlist-tree">
          <div className="playlist-item">
            <div
              className="playlist-path"
              onClick={() => handleMove(undefined)}
            >
              No Playlist
            </div>
          </div>
          {renderPlaylistTree(filteredPlaylists)}
        </div>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default MoveItemModal;