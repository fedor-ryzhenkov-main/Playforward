export const environment = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    credentials: 'include' as RequestCredentials
  },
  auth: {
    googleAuthUrl: `${process.env.REACT_APP_API_URL}/auth/google`,
    userProfileUrl: `${process.env.REACT_APP_API_URL}/auth/user`
  }
}; 