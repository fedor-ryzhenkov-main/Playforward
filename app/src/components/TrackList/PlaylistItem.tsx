import React, { useState, useEffect } from 'react';
import Playlist from '../../data/models/Playlist';
import Track from '../../data/models/Track';
import TrackItem from './TrackItem';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { useContextMenuRegistration } from '../../contexts/ContextMenuContext';
import PlaylistService from '../../data/services/PlaylistService';
import MoveItemModal from '../MoveItemModal/MoveItemModal';
import './PlaylistItem.css';

interface PlaylistItemProps {
  playlist: Playlist;
  tracks: Track[];
  subPlaylists: Playlist[];
}

/**
 * Component representing a single playlist item, which can be toggled to show or hide its tracks and sub-playlists.
 */
const PlaylistItem: React.FC<PlaylistItemProps> = ({ playlist, tracks, subPlaylists }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { registerMenuItems } = useContextMenuRegistration();
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const playlistService = new PlaylistService();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const childPlaylists = subPlaylists.filter((p) => p.parentId === playlist.id);
  const playlistTracks = tracks.filter((t) => t.parentId === playlist.id);

  useEffect(() => {
    const handleAggregateContextMenu = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.registerMenuItems === 'function') {
        customEvent.detail.registerMenuItems([
          {
            label: 'Move Playlist',
            onClick: () => {
              handleMovePlaylist();
            },
          },
        ]);
      }
    };

    const element = document.getElementById(`playlist-item-${playlist.id}`);
    element?.addEventListener('contextmenu-aggregate', handleAggregateContextMenu);

    return () => {
      element?.removeEventListener('contextmenu-aggregate', handleAggregateContextMenu);
    };
  }, [registerMenuItems, playlist]);

  const handleMovePlaylist = () => {
    setIsMoveModalOpen(true);
  };

  return (
    <div className="playlist-item" id={`playlist-item-${playlist.id}`}>
      <div className="playlist-header" onClick={toggleOpen}>
        {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        <span>{playlist.name}</span>
      </div>
      {isOpen && (
        <div className="playlist-content">
          {childPlaylists.map((subPlaylist) => (
            <PlaylistItem
              key={subPlaylist.id}
              playlist={subPlaylist}
              tracks={tracks}
              subPlaylists={subPlaylists}
            />
          ))}
          {playlistTracks.map((track) => (
            <TrackItem key={track.id} track={track} />
          ))}
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
};

export default PlaylistItem;