import React from 'react';
import AudioUploader from './components/AudioUploader';
import TrackList from './components/TrackList';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Playforward</h1>
      <AudioUploader />
      <TrackList />
    </div>
  );
};

export default App;