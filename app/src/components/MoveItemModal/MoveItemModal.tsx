import React, { useState, useEffect } from 'react';
import './MoveItemModal.css';
import LibraryItem from '../../data/models/LibraryItem';
import BaseService, { ResolvedPlaylist } from '../../data/services/BaseService';
import { BaseRepository } from '../../data/repositories/BaseRepository';
import EventDispatcher from '../../data/events/EventDispatcher';
import Playlist from '../../data/models/Playlist';

interface MoveItemModalProps {
  item: LibraryItem;
  onClose: () => void;
  onMove: () => void;
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({
  item,
  onClose,
  onMove,
}) => {
  const [playlists, setPlaylists] = useState<ResolvedPlaylist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<ResolvedPlaylist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const baseService = new BaseService(new BaseRepository<LibraryItem>('libraryObjectStore'));

  useEffect(() => {
    const loadPlaylists = async () => {
      const allItems = await baseService.getAllItems();
      const playlistItems = allItems.filter(item => item.type === 'playlist') as Playlist[];
      const resolvedTree = await baseService.buildTree(playlistItems);
      const allPlaylists = flattenTree(resolvedTree);
      setPlaylists(allPlaylists);
      setFilteredPlaylists(allPlaylists);
    };
    loadPlaylists();
  }, [baseService]);

  // Helper function to flatten the tree structure
  const flattenTree = (tree: (LibraryItem | ResolvedPlaylist)[]): ResolvedPlaylist[] => {
    const flattened: ResolvedPlaylist[] = [];
    const stack = [...tree];
    while (stack.length > 0) {
      const item = stack.pop();
      if (item && item.type === 'playlist') {
        flattened.push(item as ResolvedPlaylist);
        if ((item as ResolvedPlaylist).items) {
          stack.push(...(item as ResolvedPlaylist).items);
        }
      }
    }
    return flattened;
  };

  useEffect(() => {
    let filtered = playlists;
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = playlists.filter((playlist) =>
        playlist.fullPath.toLowerCase().includes(lowerSearchTerm)
      );
    }
    // Filter out the current playlist to prevent moving under itself
    if (item.type === 'playlist') {
      filtered = filtered.filter((playlist) => playlist.id !== item.id);
    }
    setFilteredPlaylists(filtered);
  }, [searchTerm, playlists, item]);

  const handleMove = async (playlistId?: string) => {
    if (item.parentId === playlistId) {
      // No change in parentId, do nothing
      onMove();
      return;
    }

    try {
      await baseService.updateItem({ ...item, parentId: playlistId || undefined });
      EventDispatcher.getInstance().emit('dataChanged'); // Emit only on actual move
      onMove();
    } catch (error) {
      console.error('Error moving item:', error);
      alert('Failed to move item.');
    }
  };

  const renderPlaylistList = (): React.ReactNode => {
    return filteredPlaylists.map((playlist) => (
      <div key={playlist.id} className="playlist-item">
        <div
          className="playlist-name"
          onClick={() => handleMove(playlist.id)}
        >
          {playlist.fullPath}
        </div>
      </div>
    ));
  };

  return (
    <div className="move-item-modal">
      <h2>Move Item to Playlist</h2>
      <input
        type="text"
        placeholder="Search Playlists"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="playlist-list">
        <div className="playlist-item">
          <div className="playlist-name" onClick={() => handleMove(undefined)}>
            No Playlist
          </div>
        </div>
        {renderPlaylistList()}
      </div>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default MoveItemModal;