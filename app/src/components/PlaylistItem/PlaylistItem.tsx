import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { useContextMenu } from '../ContextMenu/Controller';
import MoveItemModal from '../MoveItemModal/MoveItemModal';
import TrackItem from '../TrackItem/TrackItem';
import Track from '../../data/models/Track';
import { ResolvedPlaylist } from '../../data/services/BaseService';
import BaseService from '../../data/services/BaseService';
import './PlaylistItem.css';
import Playlist from '../../data/models/Playlist';
import { BaseRepository } from '../../data/repositories/BaseRepository';
import { v4 as uuidv4 } from 'uuid';
import { ContextMenuItem } from '../ContextMenu/Controller';

interface PlaylistItemProps {
  playlist: ResolvedPlaylist;
}

const PlaylistItem: React.FC<PlaylistItemProps> = React.memo(({ playlist }) => {
  const [isOpen, setIsOpen] = useState(false);
  const baseService = new BaseService(new BaseRepository<Playlist>('libraryObjectStore'));
  const { registerMenuItems, unregisterMenuItems, openModal, closeModal } = useContextMenu();
  const contextMenuId = useRef(`playlist-${playlist.id}-${uuidv4()}`);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleDeletePlaylist = useCallback(() => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${playlist.name}"?`);
    if (confirmDelete) {
      baseService.deleteItem(playlist.id);
    }
  }, [baseService, playlist.id, playlist.name]);

  useEffect(() => {
    const menuItems: ContextMenuItem[] = [
      {
        type: 'modal',
        label: 'Move Playlist',
        modalContent: () => (
          <MoveItemModal
            item={playlist}
            onClose={closeModal}
            onMove={() => {
              closeModal();
              // Refresh logic if necessary
            }}
          />
        ),
      },
      {
        type: 'action',
        label: 'Delete Playlist',
        onClick: handleDeletePlaylist,
      },
    ];

    registerMenuItems(contextMenuId.current, menuItems);

    return () => {
      unregisterMenuItems(contextMenuId.current);
    };
  }, [
    registerMenuItems,
    unregisterMenuItems,
    contextMenuId,
    closeModal,
    playlist,
  ]);

  const renderItems = (): React.ReactNode => {
    return playlist.items.map((item) => {
      if (item.type === 'playlist') {
        return <PlaylistItem key={item.id} playlist={item as ResolvedPlaylist} />;
      } else if (item.type === 'track') {
        return <TrackItem key={item.id} track={item as Track} />;
      } else {
        return null;
      }
    });
  };

  return (
    <div className="playlist-item">
      <div 
        className="playlist-header" 
        onClick={toggleOpen}
        data-contextmenu-id={contextMenuId.current}
      >
        {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        <span>{playlist.name}</span>
      </div>
      {isOpen && (
        <div className="playlist-content">
          {renderItems()}
        </div>
      )}
    </div>
  );
});

export default PlaylistItem;