import React, { useState } from 'react';
import './PromptModal.css';

interface PromptModalProps {
  title: string;
  message: string;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

const PromptModal: React.FC<PromptModalProps> = ({
  title,
  message,
  initialValue = '',
  onClose,
  onSubmit,
}) => {
  const [inputValue, setInputValue] = useState<string>(initialValue);

  const handleSubmit = () => {
    onSubmit(inputValue);
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{message}</p>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        autoFocus
      />
      <div className="modal-buttons">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSubmit}>OK</button>
      </div>
    </div>
  );
};

export default PromptModal;