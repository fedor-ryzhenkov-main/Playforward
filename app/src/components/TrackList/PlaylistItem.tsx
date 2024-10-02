import React, { useState } from 'react';
import Playlist from '../../data/models/Playlist';
import Track from '../../data/models/Track';
import TrackItem from './TrackItem';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

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

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const childPlaylists = subPlaylists.filter((p) => p.parentId === playlist.id);
  const playlistTracks = tracks.filter((t) => t.playlistId === playlist.id);

  return (
    <div className="playlist-item">
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
    </div>
  );
};

export default PlaylistItem;