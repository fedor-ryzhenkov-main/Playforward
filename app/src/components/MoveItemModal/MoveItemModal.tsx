import React, { useState, useEffect } from 'react';
import './MoveItemModal.css';
import Track from '../../data/models/Track';
import Playlist from '../../data/models/Playlist';
import LibraryItem from '../../data/models/LibraryItem';
import BaseService from '../../data/services/BaseService';
import { BaseRepository } from '../../data/repositories/BaseRepository';

interface MoveItemModalProps {
  item: LibraryItem;
  onClose: () => void;
  onMove: () => void;
}

/**
 * Modal component for moving an item (track or playlist) to a different playlist.
 */
const MoveItemModal: React.FC<MoveItemModalProps> = ({
  item,
  onClose,
  onMove,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const baseService = new BaseService(new BaseRepository<LibraryItem>('libraryObjectStore'));

  useEffect(() => {
    const loadPlaylists = async () => {
      const allPlaylists = await baseService.getAllItems('playlist') as Playlist[];
      setPlaylists(allPlaylists);
      setFilteredPlaylists(allPlaylists);
    };
    loadPlaylists();
  }, [baseService]);

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
      await baseService.updateItem({...item, parentId: playlistId});
      onMove();
    } catch (error) {
      console.error('Error moving item:', error);
      alert('Failed to move item.');
    }
  };

  const renderPlaylistTree = (): React.ReactNode => {
    return filteredPlaylists.map((playlist) => (
      <div key={playlist.id} className="playlist-item">
        <div
          className="playlist-path"
          onClick={() => handleMove(playlist.id)}
        >
          {playlist.name}
        </div>
      </div>
    ));
  };

  return (
    <div className="modal-overlay">
      <div className="move-item-modal">
        <h2>Move Item to Playlist</h2>
        <input
          type="text"
          placeholder="Search Playlists"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="playlist-tree">
          <div className="playlist-item">
            <div className="playlist-path" onClick={() => handleMove(undefined)}>
              No Playlist
            </div>
          </div>
          {renderPlaylistTree()}
        </div>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default MoveItemModal;