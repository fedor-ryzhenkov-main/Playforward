import React, { useState, useEffect } from 'react';
import Track from '../../data/models/Track';
import TrackService from '../../data/services/TrackService';
import { removeFileExtension } from '../../utils/files/removeFileExtension';
import './EditTrackPopup.css';

interface EditTrackPopupProps {
  track: Track;
  onClose: () => void;
  onUpdate: () => void;
}

const EditTrackPopup: React.FC<EditTrackPopupProps> = ({ track, onClose, onUpdate }) => {
  const [name, setName] = useState(removeFileExtension(track.name));
  const [tags, setTags] = useState(track.tags.join(', '));
  const [description, setDescription] = useState(track.description || '');
  const trackService = new TrackService();

  // Synchronize local state with track props only when the component mounts or track.id changes
  useEffect(() => {
    setName(removeFileExtension(track.name));
    setTags(track.tags.join(', '));
    setDescription(track.description || '');
  }, [track.id, track.name, track.tags, track.description]);

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    // Append the original file extension
    const updatedName = newName + getFileExtension(track.name);

    track = {
      ...track,
      name: updatedName,
    };

    // Update the database
    await trackService.updateTrack(track);

    // Notify parent component
    onUpdate();
  };

  const handleTagsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTags = e.target.value;
    setTags(newTags);

    // Process tags into an array
    const updatedTags = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);

    track = {
      ...track,
      tags: updatedTags,
    };

    // Update the database
    await trackService.updateTrack(track);

    // Notify parent component
    onUpdate();
  };

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    track = {
      ...track,
      description: newDescription,
    };

    // Update the database
    await trackService.updateTrack(track);

    // Notify parent component
    onUpdate();
  };

  return (
    <div className="edit-popup">
      <h2>Edit Track</h2>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
        />
      </label>
      <label>
        Tags:
        <input
          type="text"
          value={tags}
          onChange={handleTagsChange}
        />
      </label>
      <label>
        Description:
        <textarea
          value={description}
          onChange={handleDescriptionChange}
        />
      </label>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default EditTrackPopup;

// Helper function to get the file extension
function getFileExtension(filename: string): string {
  const index = filename.lastIndexOf('.');
  return index !== -1 ? filename.substring(index) : '';
}