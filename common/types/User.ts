/**
 * Represents a user in the system.
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  pictureUrl: string;
}

/**
 * Represents the authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
