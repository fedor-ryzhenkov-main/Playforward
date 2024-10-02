import React, { useState } from 'react';
import './CreatePlaylistPopup.css';

interface CreatePlaylistPopupProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreatePlaylistPopup: React.FC<CreatePlaylistPopupProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleCreate = () => {
    onCreate(name);
    onClose();
  };

  return (
    <div className="edit-popup">
      <h2>Create Playlist</h2>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
        />
      </label>
      <button onClick={handleCreate}>Create</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default CreatePlaylistPopup;