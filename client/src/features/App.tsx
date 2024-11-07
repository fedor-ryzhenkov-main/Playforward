import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { AppDispatch, RootState } from 'store';
import { checkAuthStatus } from 'store/auth/authThunks';
import Welcome from 'features/pages/Welcome';
import Player from 'features/pages/Playforward';
import Login from 'features/pages/Login';
import AppHeader from 'features/components/AppHeader';
import { ModalManager } from './components/modal/ModalManager';
import { Text } from 'design-system/components';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      dispatch(checkAuthStatus());
    }
  }, [isAuthenticated, loading, dispatch]);
  
  if (loading) {
    return <Text>Loading...</Text>;
  }
  
  return isAuthenticated && user ? element : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <>
      <ModalManager />
      <BrowserRouter>
        <AppHeader />
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/player" element={<PrivateRoute element={<Player />} />} />
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