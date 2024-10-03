import React, { useEffect } from 'react';
import LibraryItem from '../../data/models/LibraryItem';
import Track from '../../data/models/Track';
import TrackItem from '../TrackItem/TrackItem';
import PlaylistItem from '../PlaylistItem/PlaylistItem';
import './Styles.css';
import { ResolvedPlaylist } from '../../data/services/BaseService';

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

/**
 * Presentational component for displaying the track list, search inputs, and actions.
 */
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
  /**
   * Handles the creation of a new playlist via prompt.
   */
  const handleCreatePlaylist = () => {
    const playlistName = prompt('Enter playlist name:');
    if (playlistName && playlistName.trim() !== '') {
      onCreatePlaylist(playlistName.trim());
    }
  };

  /**
   * Handles the upload of a new track via file input.
   */
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

  /**
   * Renders the hierarchical list of tracks and playlists.
   * @param items The array of LibraryItems to render.
   * @returns A React node representing the list.
   */
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

  useEffect(() => {
    const handleContextMenu = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (
        customEvent.detail &&
        typeof customEvent.detail.registerMenuItems === 'function'
      ) {
        customEvent.detail.registerMenuItems([
          {
            label: 'Create Playlist',
            onClick: () => {
              handleCreatePlaylist();
            },
          },
          {
            label: 'Upload Track',
            onClick: () => {
              handleUploadTrack();
            },
          },
        ]);
      }
    };

    const element = document.getElementById('track-list-container');
    element?.addEventListener('contextmenu-aggregate', handleContextMenu);

    return () => {
      element?.removeEventListener(
        'contextmenu-aggregate',
        handleContextMenu
      );
    };
  }, [onCreatePlaylist, onUploadTrack]);

  return (
    <div className="track-list-container" id="track-list-container">
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