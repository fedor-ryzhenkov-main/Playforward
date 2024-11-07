import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'store';
import { initiateGoogleLogin } from 'store/auth/authThunks';
import { Stack, Button, Header, Text } from 'design-system/components';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleGoogleLogin = () => {
    dispatch(initiateGoogleLogin());
  };

  return (
    <Stack direction="vertical" align="center" className="min-h-screen bg-background-primary">
      <Stack direction="vertical" gap="md" className="w-full max-w-md p-6 bg-white rounded shadow">
        <Header level={2}>Login to Playforward</Header>
        <Text className="text-text-secondary">
          Please sign in with your Google account to continue
        </Text>
        <Button
          variant="primary"
          onClick={handleGoogleLogin}
          className="w-full"
        >
          Sign in with Google
        </Button>
      </Stack>
    </Stack>
  );
};

export default Login;