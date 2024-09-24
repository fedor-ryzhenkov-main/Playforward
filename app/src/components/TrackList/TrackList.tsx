import React, { useState, useEffect } from 'react';
import { getAllAudioKeys, deleteAudioFromIndexedDB } from '../../data/audioStorage';
import { removeFileExtension } from '../../utils/files/removeFileExtension';
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import EditTrackPopup from '../EditTrackPopup/EditTrackPopup';
import dbEventEmitter from '../../utils/events/eventEmitters';
import './TrackList.css';
import Track from '../../models/track';

const TrackList: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [openPlayers, setOpenPlayers] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ trackId: string, x: number, y: number } | null>(null);
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [searchName, setSearchName] = useState<string>('');
  const [searchTags, setSearchTags] = useState<string>('');

  useEffect(() => {
    loadTracks();

    const handleDatabaseUpdate = () => {
      loadTracks();
    };

    dbEventEmitter.on('databaseUpdated', handleDatabaseUpdate);

    return () => {
      dbEventEmitter.off('databaseUpdated', handleDatabaseUpdate);
    };
  }, []);

  const loadTracks = async () => {
    const keys = await getAllAudioKeys();
    setTracks(keys);
  };

  const handleTrackDoubleClick = (trackId: string) => {
    if (!openPlayers.includes(trackId)) {
      setOpenPlayers(prev => [...prev, trackId]);
    }
  };

  const handleClosePlayer = (trackId: string) => {
    setOpenPlayers(prev => prev.filter(t => t !== trackId));
  };

  const handleContextMenu = (event: React.MouseEvent, trackId: string) => {
    event.preventDefault();
    setContextMenu({ trackId, x: event.clientX, y: event.clientY });
  };

  const handleEditTrack = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      setEditTrack(track);
      setContextMenu(null);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    await deleteAudioFromIndexedDB(trackId);
    setContextMenu(null);
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleEditPopupClose = () => {
    setEditTrack(null);
  };

  const filteredTracks = tracks.filter(track => {
    const nameMatch = removeFileExtension(track.name).toLowerCase().includes(searchName.toLowerCase());
    const tagsMatch = searchTags === '' || track.tags.some(tag => tag.toLowerCase().includes(searchTags.toLowerCase()));
    return nameMatch && tagsMatch;
  });

  return (
    <div className="track-list-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by tags"
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
        />
      </div>
      <ul className="track-list">
        {filteredTracks.map((track) => (
          <li
            key={track.id}
            onDoubleClick={() => handleTrackDoubleClick(track.id)}
            onContextMenu={(e) => handleContextMenu(e, track.id)}
            className={openPlayers.includes(track.id) ? 'selected' : ''}
          >
            <span className="track-name">{removeFileExtension(track.name)}</span>
            <span className="separator">|</span>
            <span className="track-tags">{track.tags.join(', ') || 'No tags'}</span>
            <span className="separator">|</span>
            <span className="track-description">{track.description || 'No description'}</span>
          </li>
        ))}
      </ul>
      {openPlayers.map((trackId) => (
        <AudioPlayer
          key={trackId}
          trackKey={trackId}
          onClose={handleClosePlayer}
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