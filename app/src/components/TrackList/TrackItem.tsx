import React, { useEffect, useState } from 'react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import Track from '../../data/models/Track';
import { ContextMenuItem } from '../ContextMenu/ContextMenu';
import TrackService from '../../data/services/TrackService';
import './TrackItem.css';
import { useContextMenuRegistration } from '../../contexts/ContextMenuContext';
import MoveItemModal from '../MoveItemModal/MoveItemModal';

interface TrackItemProps {
  track: Track;
}

const TrackItem: React.FC<TrackItemProps> = ({ track }) => {
  const { playTrack, stopTrack, isPlaying } = useAudioPlayer();
  const trackService = new TrackService();
  const { registerMenuItems } = useContextMenuRegistration();
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);

  const handleClick = () => {
    if (isPlaying(track.id)) {
      stopTrack(track.id);
    } else {
      playTrack(track.id);
    }
  };

  useEffect(() => {
    const handleAggregateContextMenu = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.registerMenuItems === 'function') {
        customEvent.detail.registerMenuItems([
          {
            label: 'Delete Track',
            onClick: () => {
              handleDeleteTrack();
            },
          },
          {
            label: 'Rename Track',
            onClick: () => {
              handleRenameTrack();
            },
          },
          {
            label: 'Edit Tags',
            onClick: () => {
              handleEditTags();
            },
          },
          {
            label: 'Edit Description',
            onClick: () => {
              handleEditDescription();
            },
          },
          {
            label: 'Move',
            onClick: () => {
              handleMoveTrack();
            },
          },
        ]);
      }
    };

    const element = document.getElementById(`track-item-${track.id}`);
    element?.addEventListener('contextmenu-aggregate', handleAggregateContextMenu);

    return () => {
      element?.removeEventListener('contextmenu-aggregate', handleAggregateContextMenu);
    };
  }, [registerMenuItems, track]);

  const handleDeleteTrack = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${track.name}"?`);
    if (confirmDelete) {
      try {
        await trackService.deleteTrack(track.id);
      } catch (error) {
        console.error('Error deleting track:', error);
        alert('Failed to delete track.');
      }
    }
  };

  const handleRenameTrack = async () => {
    const newName = prompt('Enter new track name:', track.name);
    if (newName && newName.trim() !== '') {
      try {
        await trackService.renameTrack(track.id, newName.trim());
        alert('Track renamed successfully!');
      } catch (error) {
        console.error('Error renaming track:', error);
        alert('Failed to rename track.');
      }
    }
  };

  const handleEditTags = async () => {
    const newTags = prompt('Enter comma-separated tags:', track.tags.join(', '));
    if (newTags !== null) {
      const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      try {
        await trackService.updateTrackTags(track.id, tagsArray);
        alert('Tags updated successfully!');
      } catch (error) {
        console.error('Error updating tags:', error);
        alert('Failed to update tags.');
      }
    }
  };

  const handleEditDescription = async () => {
    const newDescription = prompt('Enter new description:', track.description || '');
    if (newDescription !== null) {
      try {
        await trackService.updateTrackDescription(track.id, newDescription.trim());
        alert('Description updated successfully!');
      } catch (error) {
        console.error('Error updating description:', error);
        alert('Failed to update description.');
      }
    }
  };

  const handleMoveTrack = () => {
    setMoveModalOpen(true);
  };

  return (
    <>
      <div 
        className="track-item" 
        id={`track-item-${track.id}`}
      >
        <div
          className={`track-info ${isPlaying(track.id) ? 'playing' : ''}`}
          onClick={handleClick}
        >
          <div className="track-details">
            <span className="track-name">{track.name}</span>
            {track.description && (
              <span className="track-description">{track.description}</span>
            )}
            {track.tags && track.tags.length > 0 && (
              <div className="track-tags">
                {track.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {isMoveModalOpen && (
        <MoveItemModal
          item={track}
          onClose={() => setMoveModalOpen(false)}
          onMove={() => {
            // Refresh logic if necessary
            setMoveModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default TrackItem;