import React, { useState, useEffect } from 'react';
import './MoveItemModal.css';
import LibraryItem from '../../data/models/LibraryItem';
import BaseService from '../../data/services/BaseService';
import Playlist from '../../data/models/Playlist';

interface MoveItemModalProps {
  item: LibraryItem;
  onClose: () => void;
  onSubmit: (playlistId?: string) => void;
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({ item, onClose, onSubmit }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [descendantIds, setDescendantIds] = useState<Set<string>>(new Set());
  const baseService = new BaseService();

  useEffect(() => {
    const loadPlaylists = async () => {
      const tree = await baseService.buildTree();
      const allPlaylists = flattenPlaylists(tree);
      setPlaylists(allPlaylists);

      if (item.type === 'playlist') {
        const ids = getDescendantIds(item as Playlist);
        setDescendantIds(new Set(ids));
      } else {
        setDescendantIds(new Set());
      }
    };
    loadPlaylists();
  }, [item]);

  const flattenPlaylists = (items: LibraryItem[]): Playlist[] => {
    const playlists: Playlist[] = [];
    const stack = [...items];

    while (stack.length > 0) {
      const currentItem = stack.pop();

      if (currentItem && currentItem.type === 'playlist') {
        const playlist = currentItem as Playlist;
        playlists.push(playlist);

        if (playlist.children && playlist.children.length > 0) {
          stack.push(...playlist.children);
        }
      }
    }

    return playlists;
  };

  const getDescendantIds = (playlist: Playlist): string[] => {
    let ids: string[] = [];
    if (playlist.children) {
      for (const child of playlist.children) {
        ids.push(child.id);
        if (child.type === 'playlist') {
          ids = ids.concat(getDescendantIds(child as Playlist));
        }
      }
    }
    return ids;
  };

  useEffect(() => {
    let filtered = playlists;

    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = playlists.filter((playlist) =>
        playlist.name.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (item.type === 'playlist') {
      // Exclude the item itself and its descendants
      filtered = filtered.filter(
        (playlist) => playlist.id !== item.id && !descendantIds.has(playlist.id)
      );
    }

    setFilteredPlaylists(filtered);
  }, [searchTerm, playlists, item, descendantIds]);

  const handleMove = async (playlistId?: string) => {
    try {
      await baseService.moveItem(item.id, playlistId);
      onSubmit(playlistId);
    } catch (error) {
      console.error('Error moving item:', error);
      alert('Failed to move item. ' + (error as Error).message);
    }
  };

  const renderPlaylistList = (): React.ReactNode => {
    return filteredPlaylists.map((playlist) => (
      <div key={playlist.id} className="playlist-item">
        <div className="playlist-name" onClick={() => handleMove(playlist.id)}>
          {playlist.name}
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
      <div className="modal-buttons">
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default MoveItemModal;