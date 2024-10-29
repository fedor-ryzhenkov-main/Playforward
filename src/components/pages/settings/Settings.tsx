import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="settings-container">
      <div className="settings-content">
        <h1 className="settings-title">Settings</h1>
        {/* Add settings controls here */}
        <button 
          className="settings-back-button" 
          onClick={() => navigate('/welcome')}
        >
          Back to Welcome
        </button>
      </div>
    </div>
  );
};

export default Settings; 