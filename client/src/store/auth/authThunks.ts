import { createAsyncThunk } from '@reduxjs/toolkit';
import { authRequest, authSuccess, authFailure, logout } from './authSlice';

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch }) => {
    dispatch(authRequest());
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/user`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        dispatch(authFailure(error.error || 'Authentication failed'));
        return null;
      }

      const userData = await response.json();
      if (userData && userData.id) {
        dispatch(authSuccess(userData));
        return userData;
      } else {
        dispatch(authFailure('Invalid user data received'));
        return null;
      }
    } catch (error: any) {
      dispatch(authFailure(error.message || 'Authentication check failed'));
      return null;
    }
  }
);

export const initiateGoogleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { dispatch }) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      dispatch(logout());
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  }
);