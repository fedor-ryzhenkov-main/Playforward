import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from 'store';
import { logoutUser } from 'store/auth/authThunks';
import { Button, Stack, Text, Header } from 'design-system/components';
import { useNavigate } from 'react-router-dom';

const AppHeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/welcome');
  };

  return (
    <Stack direction="horizontal" align="center" justify="center" className="p-4 bg-white shadow">
      {isAuthenticated && user && (
        <Stack direction="horizontal" gap="md" align="center">
          <Stack direction="horizontal" gap="sm" align="center">
            {user.picture_url && (
              <img 
                src={user.picture_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <Text>{user.display_name || user.email}</Text>
          </Stack>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default AppHeader;