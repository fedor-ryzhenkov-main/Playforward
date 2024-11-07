/**
 * Represents a user in the system.
 */
export interface User {
  /**
   * Unique identifier for the user
   */
  id: string;

  /**
   * User's email address from OAuth provider
   */
  email: string;

  /**
   * User's display name
   */
  display_name: string;

  /**
   * URL to user's profile picture
   */
  picture_url: string;

  /**
   * Timestamp when the user was created
   */
  created_at: string;
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
