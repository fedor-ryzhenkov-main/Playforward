import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Playforward</h1>
        <p className="welcome-subtitle">A tiny music player for TTRPGs</p>
        <div className="welcome-buttons">
          <button 
            className="welcome-button primary" 
            onClick={() => navigate('/player')}
          >
            Launch
          </button>
          <button 
            className="welcome-button secondary" 
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
        </div>
      </div>
      <p className="welcome-footer">
        Created by <a href="https://inner-space.fedor-ryzhenkov.com" target="_blank" rel="noopener noreferrer">Fedor Ryzhenkov</a>
      </p>
    </div>
  );
};

export default Welcome;