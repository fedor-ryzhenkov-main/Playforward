import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import store from '../store';
import { logout } from '../store/auth/authSlice';

class Api {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          store.dispatch(logout());
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }

  // HTTP method wrappers
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

// Export singleton instance
export const api = new Api(); 