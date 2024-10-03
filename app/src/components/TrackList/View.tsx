import React, { useEffect, useRef } from 'react';
import LibraryItem from '../../data/models/LibraryItem';
import Track from '../../data/models/Track';
import TrackItem from '../TrackItem/TrackItem';
import PlaylistItem from '../PlaylistItem/PlaylistItem';
import './Styles.css';
import { ResolvedPlaylist } from '../../data/services/BaseService';
import { useContextMenu } from '../ContextMenu/Controller';
import { v4 as uuidv4 } from 'uuid';

interface TrackListViewProps {
  trackTree: LibraryItem[];
  loading: boolean;
  error: string | null;
  searchName: string;
  searchTags: string;
  onSearchNameChange: (name: string) => void;
  onSearchTagsChange: (tags: string) => void;
  onCreatePlaylist: (playlistName: string) => void;
  onUploadTrack: (file: File) => void;
  onExportData: () => void;
  onImportData: () => void;
}

const TrackListView: React.FC<TrackListViewProps> = ({
  trackTree,
  loading,
  error,
  searchName,
  searchTags,
  onSearchNameChange,
  onSearchTagsChange,
  onCreatePlaylist,
  onUploadTrack,
  onExportData,
  onImportData,
}) => {
  const { registerMenuItems, unregisterMenuItems } = useContextMenu();
  const contextMenuId = useRef(`tracklist-${uuidv4()}`);

  const handleCreatePlaylist = () => {
    const playlistName = prompt('Enter playlist name:');
    if (playlistName && playlistName.trim() !== '') {
      onCreatePlaylist(playlistName.trim());
    }
  };

  const handleUploadTrack = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        await onUploadTrack(file);
      }
    };
    fileInput.click();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target instanceof HTMLElement && !e.target.closest('.track-name')) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const menuItems = [
      {
        label: 'Create Playlist',
        onClick: handleCreatePlaylist,
      },
      {
        label: 'Upload Track',
        onClick: handleUploadTrack,
      },
    ];

    registerMenuItems(contextMenuId.current, menuItems);

    return () => {
      unregisterMenuItems(contextMenuId.current);
    };
  }, [registerMenuItems, unregisterMenuItems]);

  const renderItems = (items: LibraryItem[]): React.ReactNode => {
    return items.map((item) => {
      if (item.type === 'playlist') {
        const playlist = item as ResolvedPlaylist;
        return <PlaylistItem key={playlist.id} playlist={playlist} />;
      } else if (item.type === 'track') {
        const track = item as Track;
        return <TrackItem key={track.id} track={track} />;
      } else {
        return null;
      }
    });
  };

  return (
    <div 
      className="track-list-container" 
      id="track-list-container"
      data-contextmenu-id={contextMenuId.current}
      onTouchStart={handleTouchStart}
    >
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by tags"
          value={searchTags}
          onChange={(e) => onSearchTagsChange(e.target.value)}
        />
        <div className="actions-container">
          <button onClick={onExportData}>Export Library</button>
          <button onClick={onImportData}>Import Library</button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="track-list">{renderItems(trackTree)}</div>
      <div className="context-menu-hint">Right-click to open context menu</div>
    </div>
  );
};

export default TrackListView;