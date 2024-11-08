import { createAsyncThunk } from '@reduxjs/toolkit';
import { authRequest, authSuccess, authFailure, logout } from './authSlice';
import { environment } from 'config/environment';
import { api } from 'services/api';
import { User } from '@common/types/User';
import { ApiResponse } from '@common/types/Api';

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch }) => {
    dispatch(authRequest());
    try {
      const response = await api.get<ApiResponse<User>>(environment.auth.userProfileUrl);
      if (response.data && response.data.id) {
        dispatch(authSuccess(response.data));
        return response.data;
      }
      dispatch(authFailure('Invalid user data received'));
      return null;
    } catch (error: any) {
      dispatch(authFailure(error.message || 'Authentication check failed'));
      return null;
    }
  }
);

export const initiateGoogleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { dispatch }) => {
    try {
      // First check if the session is already valid
      const response = await api.get<ApiResponse<{authenticated: boolean, user: User | null}>>(environment.auth.checkAuthUrl);
      if (response.data?.authenticated) {
        return dispatch(authSuccess(response.data.user!));
      }
      
      // If not authenticated, redirect to Google OAuth
      window.location.href = environment.auth.googleAuthUrl;
    } catch (error) {
      dispatch(authFailure('Failed to initiate login'));
      throw error;
    }
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