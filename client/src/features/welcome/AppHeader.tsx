import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from 'store';
import { logoutUser } from 'store/auth/authThunks';
import { Button, Stack, Text } from 'design-system/components';
import { useNavigate } from 'react-router-dom';

const AppHeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <Stack direction="horizontal" align="center" className="p-4 bg-white">
      {isAuthenticated && user && (
        <Stack direction="horizontal" gap="md" align="center">
          {user.pictureUrl && (
            <img 
              src={user.pictureUrl} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
          )}
          <Text>{user.displayName}</Text>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default AppHeader;