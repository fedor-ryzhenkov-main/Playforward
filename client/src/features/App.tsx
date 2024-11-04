import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store, { AppDispatch } from 'store';
import Welcome from 'features/pages/Welcome';
import Player from 'features/pages/Playforward';
import Settings from 'features/pages/Settings';
import { ModalManager } from './components/modal/ModalManager';
import AppHeader from 'features/components/AppHeader';
import { fetchUserProfile } from 'store/auth/authThunks';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  return (
    <>
      <ModalManager />
      <BrowserRouter>
        <AppHeader />
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/player" element={<Player />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;