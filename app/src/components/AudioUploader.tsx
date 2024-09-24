import React, { useState, useRef } from 'react';
import { saveAudioToIndexedDB } from '../utils/audioStorage';
import './AudioUploader.css';

const AudioUploader: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await saveAudioToIndexedDB(file);
        setUploadStatus('File uploaded successfully!');
      } catch (error) {
        setUploadStatus('Error uploading file. Please try again.');
        console.error('Error uploading file:', error);
      }
    }
  };
  
  return (
    <div className="audio-uploader">
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()}>
        Upload Audio
      </button>
      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
    </div>
  );
};

export default AudioUploader;