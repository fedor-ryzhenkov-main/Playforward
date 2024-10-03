import React, { useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useContextMenu, ContextMenuItem } from '../../contexts/ContextMenuContext';
import { useModal } from '../../contexts/ModalContext';
import PromptModal from '../PromptModal/PromptModal';
import MoveItemModal from '../MoveItemModal/MoveItemModal';
import Track from '../../data/models/Track';
import BaseService from '../../data/services/BaseService';
import './TrackItem.css';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';

interface TrackItemProps {
  track: Track;
}

const TrackItem: React.FC<TrackItemProps> = ({ track }) => {
  const { isPlaying, playTrack, stopTrack } = useAudioPlayer();
  const baseService = new BaseService();
  const { registerMenuItems, unregisterMenuItems } = useContextMenu();
  const { openModal, closeModal } = useModal();
  const contextMenuId = useRef(`track-${track.id}-${uuidv4()}`);

  const handleClick = () => {
    if (isPlaying(track.id)) {
      stopTrack(track.id);
    } else {
      playTrack(track.id);
    }
  };

  const handleDeleteTrack = useCallback(async () => {
    openModal(
      <PromptModal
        title="Confirm Delete"
        message={`Are you sure you want to delete "${track.name}"?`}
        onClose={closeModal}
        onSubmit={async (confirmed) => {
          if (confirmed) {
            try {
              await baseService.deleteItem(track.id);
              closeModal();
            } catch (error) {
              console.error('Error deleting track:', error);
              openModal(
                <PromptModal
                  title="Error"
                  message="Failed to delete track."
                  onClose={closeModal}
                  onSubmit={closeModal}
                />
              );
            }
          } else {
            closeModal();
          }
        }}
      />
    );
  }, [baseService, track.id, track.name, openModal, closeModal]);

  const handleRenameTrack = useCallback(() => {
    openModal(
      <PromptModal
        title="Rename Track"
        message="Enter new name for the track:"
        initialValue={track.name}
        onClose={closeModal}
        onSubmit={async (newName) => {
          if (newName && newName.trim() !== '' && newName !== track.name) {
            try {
              await baseService.updateItem({ ...track, name: newName.trim() });
              closeModal();
            } catch (error) {
              console.error('Error renaming track:', error);
              openModal(
                <PromptModal
                  title="Error"
                  message="Failed to rename track."
                  onClose={closeModal}
                  onSubmit={closeModal}
                />
              );
            }
          } else {
            closeModal();
          }
        }}
      />
    );
  }, [baseService, track, openModal, closeModal]);

  const handleEditTags = useCallback(() => {
    openModal(
      <PromptModal
        title="Edit Tags"
        message="Enter comma-separated tags:"
        initialValue={track.tags.join(', ')}
        onClose={closeModal}
        onSubmit={async (newTags) => {
          const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
          try {
            await baseService.updateItem({ ...track, tags: tagsArray } as Track);
            closeModal();
          } catch (error) {
            console.error('Error updating tags:', error);
            openModal(
              <PromptModal
                title="Error"
                message="Failed to update tags."
                onClose={closeModal}
                onSubmit={closeModal}
              />
            );
          }
        }}
      />
    );
  }, [baseService, track, openModal, closeModal]);

  const handleMoveTrack = useCallback(() => {
    openModal(
      <MoveItemModal
        item={track}
        onClose={closeModal}
        onSubmit={async (newParentId) => {
          try {
            await baseService.moveItem(track.id, newParentId);
            closeModal();
          } catch (error) {
            console.error('Error moving track:', error);
            openModal(
              <PromptModal
                title="Error"
                message="Failed to move track."
                onClose={closeModal}
                onSubmit={closeModal}
              />
            );
          }
        }}
      />
    );
  }, [baseService, track, openModal, closeModal]);

  const handleEditDescription = useCallback(() => {
    openModal(
      <PromptModal
        title="Edit Description"
        message="Enter new description:"
        initialValue={track.description || ''}
        onClose={closeModal}
        onSubmit={async (newDescription) => {
          try {
            await baseService.updateItem({ ...track, description: newDescription.trim() } as Track);
            closeModal();
          } catch (error) {
            console.error('Error updating description:', error);
            openModal(
              <PromptModal
                title="Error"
                message="Failed to update description."
                onClose={closeModal}
                onSubmit={closeModal}
              />
            );
          }
        }}
      />
    );
  }, [baseService, track, openModal, closeModal]);

  useEffect(() => {
    const menuItems: ContextMenuItem[] = [
      {
        type: 'action',
        label: isPlaying(track.id) ? 'Stop Track' : 'Play Track',
        onClick: handleClick,
      },
      {
        type: 'action',
        label: 'Move Track',
        onClick: handleMoveTrack,
      },
      {
        type: 'action',
        label: 'Delete Track',
        onClick: handleDeleteTrack,
      },
      { 
        type: 'action',
        label: 'Rename Track',
        onClick: handleRenameTrack,
      },
      {
        type: 'action',
        label: 'Edit Tags',
        onClick: handleEditTags,
      },
      {
        type: 'action',
        label: 'Edit Description',
        onClick: handleEditDescription,
      },
    ];

    registerMenuItems(contextMenuId.current, menuItems);

    return () => {
      unregisterMenuItems(contextMenuId.current);
    };
  }, [
    registerMenuItems,
    unregisterMenuItems,
    contextMenuId,
    handleClick,
    isPlaying,
    track,
    handleDeleteTrack,
    handleRenameTrack,
    handleEditTags,
    handleEditDescription,
    handleMoveTrack,
  ]);

  return (
    <div 
      className="track-item" 
      data-contextmenu-id={contextMenuId.current}
    >
      <div
        className={`track-info ${isPlaying(track.id) ? 'playing' : ''}`}
        onClick={handleClick}
      >
        <div className="track-details">
          <div className="track-main-info">
            <span className="track-name">{track.name}</span>
            {track.tags.length > 0 && (
              <span className="track-tags">
                {track.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </span>
            )}
          </div>
          {track.description && (
            <div className="track-description">{track.description}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackItem;