import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginRequest, loginSuccess, loginFailure, logout } from './authSlice';

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  // Add other relevant user fields
}

/**
 * Initiates the OAuth login process by redirecting the user to the backend's OAuth endpoint.
 */
export const initiateLogin = createAsyncThunk(
  'auth/initiateLogin',
  async (_, { dispatch }) => {
    dispatch(loginRequest());
    // Redirect to the backend's OAuth initiation route
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/youtube`;
  }
);

/**
 * Fetches the authenticated user's profile from the backend.
 */
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { dispatch }) => {
    dispatch(loginRequest());
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data: UserProfile = await response.json();
      dispatch(loginSuccess(data));
    } catch (error: any) {
      dispatch(loginFailure(error.message));
    }
  }
);

/**
 * Logs out the user by hitting the backend's logout endpoint.
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        credentials: 'include',
      });
      dispatch(logout());
    } catch (error: any) {
      console.error('Logout failed:', error.message);
    }
  }
); 