import { createAsyncThunk } from '@reduxjs/toolkit';
import { authRequest, authSuccess, authFailure, logout } from './authSlice';

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch }) => {
    dispatch(authRequest());
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/user`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const userData = await response.json();
      dispatch(authSuccess(userData));
      return userData;
    } catch (error: any) {
      dispatch(authFailure(error.message));
      throw error;
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