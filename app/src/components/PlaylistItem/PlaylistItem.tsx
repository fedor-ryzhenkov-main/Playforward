import React, { useState, useEffect } from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { useContextMenuRegistration } from '../../contexts/ContextMenuContext';
import MoveItemModal from '../MoveItemModal/MoveItemModal';
import TrackItem from '../TrackItem/TrackItem';
import LibraryItem from '../../data/models/LibraryItem';
import Track from '../../data/models/Track';
import { ResolvedPlaylist } from '../../data/services/BaseService';

interface PlaylistItemProps {
  playlist: ResolvedPlaylist; // Use ResolvedPlaylist
}

/**
 * Component representing a single playlist item, which can be toggled to show or hide its contents.
 */
const PlaylistItem: React.FC<PlaylistItemProps> = React.memo(({ playlist }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { registerMenuItems } = useContextMenuRegistration();
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleAggregateContextMenu = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (
        customEvent.detail &&
        typeof customEvent.detail.registerMenuItems === 'function'
      ) {
        customEvent.detail.registerMenuItems([
          {
            label: 'Move Playlist',
            onClick: () => {
              handleMovePlaylist();
            },
          },
          // Add other context menu items if needed
        ]);
      }
    };

    const element = document.getElementById(`playlist-item-${playlist.id}`);
    element?.addEventListener('contextmenu-aggregate', handleAggregateContextMenu);

    return () => {
      element?.removeEventListener(
        'contextmenu-aggregate',
        handleAggregateContextMenu
      );
    };
  }, [registerMenuItems, playlist]);

  const handleMovePlaylist = () => {
    setIsMoveModalOpen(true);
  };

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
    <div className="playlist-item" id={`playlist-item-${playlist.id}`}>
      <div className="playlist-header" onClick={toggleOpen}>
        {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        <span>{playlist.name}</span>
      </div>
      {isOpen && (
        <div className="playlist-content">
          {renderItems()}
        </div>
      )}
      {isMoveModalOpen && (
        <MoveItemModal
          item={playlist}
          onClose={() => setIsMoveModalOpen(false)}
          onMove={() => {
            // Refresh logic if necessary
            setIsMoveModalOpen(false);
          }}
        />
      )}
    </div>
  );
});

export default PlaylistItem;