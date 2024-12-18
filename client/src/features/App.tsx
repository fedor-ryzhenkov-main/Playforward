import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { AppDispatch, RootState } from 'store';
import { checkAuthStatus } from 'store/auth/authThunks';
import Welcome from 'features/pages/Welcome';
import Player from 'features/pages/Playforward';
import Login from 'features/pages/Login';
import { Text } from 'design-system/components';
import { ModalManager } from './components/modal/ModalManager';

const AppRouter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <ModalManager />
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/player" replace /> : <Login />
          } />
          <Route path="/player" element={
            isAuthenticated ? <Player /> : <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);

export default App;