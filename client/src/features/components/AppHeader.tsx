import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from 'store';
import { initiateLogin, logoutUser } from 'store/auth/authThunks';
import { Button, Stack, Text, Header } from 'design-system/components';

const AppHeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  const handleLogin = () => {
    dispatch(initiateLogin());
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <Stack direction="horizontal" className="border-b border-border">
      <Header level={1}>Playforward</Header>
      <Stack direction="horizontal" gap="sm">
        {loading ? (
          <Text>Loading...</Text>
        ) : isAuthenticated && user ? (
          <>
            <Text>Welcome, {user.displayName}</Text>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={handleLogin}>
            Login with YouTube
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default AppHeader; 