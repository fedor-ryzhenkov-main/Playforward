import React, { useState } from 'react';
import { removeFileExtension } from '../../utils/files/removeFileExtension';
import AudioPlayerController from '../AudioPlayer/Controller';
import Track from '../../data/models/Track';
import TrackService from '../../data/services/TrackService';
import './TrackItem.css'; // Optional: For styling

interface TrackItemProps {
  track: Track;
  trackService: TrackService;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, trackService }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDoubleClick = () => {
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
  };

  return (
    <div className="track-item">
      <div
        className="track-info"
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          // Implement context menu for track operations (e.g., move, delete)
        }}
      >
        <span>{removeFileExtension(track.name)}</span>
      </div>
      {isPlaying && (
        <AudioPlayerController trackKey={track.id} service={trackService} onClose={handleClosePlayer} />
      )}
    </div>
  );
};

export default TrackItem;