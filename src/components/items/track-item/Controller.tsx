import React from 'react';
import Track from 'data/models/Track';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { playTrack } from 'store/thunks/playerThunks';
import './Styles.css';

interface TrackItemProps {
  track: Track;
  isSelected?: boolean;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  isSelected = false,
}) => {
  const dispatch = useAppDispatch();
  const playerState = useAppSelector(state => 
    state.player.activePlayers[track.id]
  );
  
  const isPlaying = playerState?.isPlaying || false;

  const handlePlay = () => {
    dispatch(playTrack(track));
  };

  return (
    <div
      className={`track-item ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}
      onClick={handlePlay}
    >
      <div className="track-info">
        <span className="track-name">{track.name}</span>
        <div className="track-tags">
          {track.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
      {isPlaying && (
        <div className="track-progress">
          <div 
            className="progress-bar"
            style={{
              width: `${(playerState?.currentTime || 0) / (playerState?.duration || 1) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TrackItem;