import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from 'components/pages/welcome/Welcome';
import Player from 'components/pages/player/Player';
import Settings from 'components/pages/settings/Settings';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/player" element={<Player />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;