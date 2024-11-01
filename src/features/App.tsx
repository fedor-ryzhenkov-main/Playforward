import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from 'store';
import Welcome from 'features/pages/Welcome';
import Player from 'features/pages/Player';
import Settings from 'features/pages/Settings';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
            <Route path="/player" element={<Player />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;