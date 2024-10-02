import React, { useState, useRef } from 'react';
import TrackService from '../../data/services/TrackService';
import './AudioUploader.css';

const AudioUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const trackService = new TrackService();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      setUploading(true);
      try {
        await trackService.saveTrack(file);
        alert('File uploaded successfully!');
        setFile(null);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="audio-uploader">
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default AudioUploader;