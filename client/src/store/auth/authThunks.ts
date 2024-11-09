import { createAsyncThunk } from '@reduxjs/toolkit';
import { authRequest, authSuccess, authFailure, logout } from './authSlice';
import { api } from 'services/api';
import { User } from '@common/types/User';
import { ApiResponse } from '@common/types/Api';

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch }) => {
    dispatch(authRequest());
    try {
      const response = await api.get<ApiResponse<{authenticated: boolean, user: User | null}>>('/auth/user', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.data.authenticated && response.data.user) {
        dispatch(authSuccess(response.data.user));
        return response.data.user;
      }
      
      dispatch(authFailure('Not authenticated'));
      return null;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        dispatch(authFailure('Not authenticated'));
        return null;
      }
      dispatch(authFailure(error.message || 'Authentication check failed'));
      throw error;
    }
  }
);

export const initiateGoogleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { dispatch }) => {
    try {
      window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
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
      await api.post<ApiResponse<{ message: string }>>('/auth/logout');
      dispatch(logout());
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
);