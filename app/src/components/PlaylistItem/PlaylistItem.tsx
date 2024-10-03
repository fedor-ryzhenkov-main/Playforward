import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { ContextMenuItem, useContextMenu } from '../../contexts/ContextMenuContext';
import MoveItemModal from '../MoveItemModal/MoveItemModal';
import TrackItem from '../TrackItem/TrackItem';
import Track from '../../data/models/Track';
import Playlist from '../../data/models/Playlist';
import './PlaylistItem.css';
import BaseService from '../../data/services/BaseService';

/**
 * Props for the PlaylistItem component.
 */
interface PlaylistItemProps {
  playlist: Playlist;
}

/**
 * PlaylistItem component responsible for rendering a playlist and its children.
 */
const PlaylistItem: React.FC<PlaylistItemProps> = React.memo(({ playlist }) => {
  const { registerMenuItems, unregisterMenuItems } = useContextMenu();
  const contextMenuId = useRef(`playlist-${playlist.id}`);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState<boolean>(false);
  const baseService = new BaseService();

  /**
   * Handles toggling the expansion of the playlist.
   */
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * Opens the move item modal.
   */
  const openMoveModal = () => {
    setIsMoveModalOpen(true);
  };

  /**
   * Closes the move item modal.
   */
  const closeMoveModal = () => {
    setIsMoveModalOpen(false);
  };

  /**
   * Handles moving the playlist to a new parent.
   * @param newParentId The ID of the new parent playlist.
   */
  const handleMove = async (newParentId?: string) => {
    await baseService.moveItem(playlist.id, newParentId);
  };

  useEffect(() => {
    const menuItems = [
      {
        type: 'action',
        label: 'Move Playlist',
        onClick: openMoveModal,
      },
    ] as ContextMenuItem[];

    registerMenuItems(contextMenuId.current, menuItems);

    return () => {
      unregisterMenuItems(contextMenuId.current);
    };
  }, [registerMenuItems, unregisterMenuItems]);

  const renderChildren = () => {
    if (!isExpanded || !playlist.children) return null;

    return playlist.children.map((child) => {
      if (child.type === 'playlist') {
        return <PlaylistItem key={child.id} playlist={child as Playlist} />;
      } else if (child.type === 'track') {
        return <TrackItem key={child.id} track={child as Track} />;
      } else {
        return null;
      }
    });
  };

  return (
    <div className="playlist-item" data-contextmenu-id={contextMenuId.current}>
      <div className="playlist-header" onClick={toggleExpand}>
        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
        <span>{playlist.name}</span>
      </div>
      {isExpanded && <div className="playlist-children">{renderChildren()}</div>}
      {isMoveModalOpen && (
        <MoveItemModal
          item={playlist}
          onClose={closeMoveModal}
          onSubmit={handleMove}
        />
      )}
    </div>
  );
});

export default PlaylistItem;