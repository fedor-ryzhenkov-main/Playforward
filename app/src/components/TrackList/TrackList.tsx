// app/src/components/TrackList/TrackList.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getAllTrackKeys,
  deleteTrackFromIndexedDB,
} from '../../data/storageAudio';
import { getAllPlaylists } from '../../data/playlistStorage';
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import EditTrackPopup from '../EditTrackPopup/EditTrackPopup';
import dbEventEmitter from '../../utils/events/eventEmitters';
import './TrackList.css';
import TrackListManager from './TrackListManager';
import Track from '../../models/track';
import Playlist from '../../models/playlist';
import { removeFileExtension } from '../../utils/files/removeFileExtension';
import { ListItem } from './TrackListManager';

const TrackList: React.FC = () => {
  const [trackListManager] = useState(new TrackListManager());
  const [openPlayers, setOpenPlayers] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    trackId: string;
    x: number;
    y: number;
  } | null>(null);
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [flatList, setFlatList] = useState<ListItem[]>([]);
  const trackListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    loadTracks();
    loadPlaylists();

    const handleDatabaseUpdate = () => {
      loadTracks();
      loadPlaylists();
    };

    dbEventEmitter.on('databaseUpdated', handleDatabaseUpdate);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      dbEventEmitter.off('databaseUpdated', handleDatabaseUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setFlatList(trackListManager.getFlatTrackList());
  }, [trackListManager]);

  const loadTracks = async () => {
    const keys = await getAllTrackKeys();
    trackListManager.setTracks(keys);
    setFlatList(trackListManager.getFlatTrackList());
  };

  const loadPlaylists = async () => {
    const playlists = await getAllPlaylists();
    trackListManager.setPlaylists(playlists);
    setFlatList(trackListManager.getFlatTrackList());
  };

  const handleTrackDoubleClick = (trackId: string) => {
    if (!openPlayers.has(trackId)) {
      setOpenPlayers((prev) => new Set(prev).add(trackId));
    }
  };

  const handleClosePlayer = (trackId: string) => {
    setOpenPlayers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(trackId);
      return newSet;
    });
  };

  const handleContextMenu = (
    event: React.MouseEvent,
    trackId: string,
    index: number
  ) => {
    event.preventDefault();
    setContextMenu({ trackId, x: event.clientX, y: event.clientY });
    setSelectedIndex(index);
  };

  const handleEditTrack = (trackId: string) => {
    const track = trackListManager.getFilteredTracks().find((t) => t.id === trackId);
    if (track) {
      setEditTrack(track);
      setContextMenu(null);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    await deleteTrackFromIndexedDB(trackId);
    setContextMenu(null);
    loadTracks();
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleEditPopupClose = () => {
    setEditTrack(null);
  };

  const handleTogglePlaylist = (playlistId: string) => {
    trackListManager.togglePlaylist(playlistId);
    setFlatList(trackListManager.getFlatTrackList());
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) {
      return;
    }

    if (flatList.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev < flatList.length - 1 ? prev + 1 : prev));
      scrollToSelectedItem();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      scrollToSelectedItem();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      const currentItem = flatList[selectedIndex];
      if (currentItem.type === 'playlist') {
        handleTogglePlaylist(currentItem.id);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const currentItem = flatList[selectedIndex];
      if (currentItem.type === 'playlist') {
        handleTogglePlaylist(currentItem.id);
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const currentItem = flatList[selectedIndex];
      if (currentItem.type === 'track') {
        handleTrackDoubleClick(currentItem.id);
      }
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      if (event.shiftKey) {
        document.getElementById('search-tags')?.focus();
      } else {
        document.getElementById('search-name')?.focus();
      }
    }
  };

  const scrollToSelectedItem = () => {
    const trackItems = trackListRef.current?.querySelectorAll('.list-item');
    if (trackItems && trackItems[selectedIndex]) {
      (trackItems[selectedIndex] as HTMLElement).scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="track-list-container">
      <div className="search-container">
        <input
          id="search-name"
          type="text"
          placeholder="Search by name"

          value={trackListManager.getSearchName()}
          onChange={(e) => {
            trackListManager.setSearchName(e.target.value);
            setFlatList(trackListManager.getFlatTrackList());
          }}
        />
        <input
          id="search-tags"
          type="text"
          placeholder="Search by tags"
          
          value={trackListManager.getSearchTags()}
          onChange={(e) => {
            trackListManager.setSearchTags(e.target.value);
            setFlatList(trackListManager.getFlatTrackList());
          }}
        />
      </div>
      <ul className="track-list" ref={trackListRef}>
        {flatList.map((item, index) => {
          const isSelected = selectedIndex === index;

          if (item.type === 'track') {
            const track = item.data as Track;
            return (
              <li
                key={track.id}
                onDoubleClick={() => handleTrackDoubleClick(track.id)}
                onContextMenu={(e) => handleContextMenu(e, track.id, index)}
                className={`list-item track-item ${isSelected ? 'selected' : ''} ${
                  openPlayers.has(track.id) ? 'playing' : ''
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <span className="track-name">{removeFileExtension(track.name)}</span>
                <span className="track-tags">{track.tags.join(', ') || 'No tags'}</span>
                <span className="track-description">
                  {track.description || 'No description'}
                </span>
              </li>
            );
          } else {
            const playlist = item.data as Playlist;
            return (
              <li key={playlist.id} className="list-item">
                <div
                  className={`playlist-header ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    handleTogglePlaylist(playlist.id);
                    setSelectedIndex(index);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedIndex(index);
                  }}
                >
                  <span>{playlist.name}</span>
                  <span>{trackListManager.getExpandedPlaylists().has(playlist.id) ? '▼' : '▶'}</span>
                </div>
              </li>
            );
          }
        })}
      </ul>
      {Array.from(openPlayers).map((trackId) => (
        <AudioPlayer
          key={trackId}
          trackKey={trackId}
          onClose={() => handleClosePlayer(trackId)}
        />
      ))}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={handleContextMenuClose}
        >
          <button onClick={() => handleEditTrack(contextMenu.trackId)}>Edit</button>
          <button onClick={() => handleDeleteTrack(contextMenu.trackId)}>Delete</button>
        </div>
      )}
      {editTrack && (
        <EditTrackPopup
          track={editTrack}
          onClose={handleEditPopupClose}
          onUpdate={loadTracks}
        />
      )}
    </div>
  );
};

export default TrackList;