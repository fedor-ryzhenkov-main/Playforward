import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { deleteAllTracks } from './data/storageAudio';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

(window as any).clearAllAudioFiles = deleteAllTracks;