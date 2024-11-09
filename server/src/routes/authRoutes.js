// server/src/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const morgan = require('morgan');
const router = express.Router();

// Configure Morgan for HTTP request logging
router.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

// Custom logging middleware
const logAuthEvent = (event, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH EVENT: ${event}`, data);
};

// Initiate Google OAuth
router.get('/google', (req, res, next) => {
  logAuthEvent('Google Auth Initiated', { ip: req.ip });
  next();
}, passport.authenticate('google', { 
  scope: ['profile', 'email']
}));

// Handle Google OAuth callback
router.get('/google/callback', 
  (req, res, next) => {
    logAuthEvent('Google Callback Received', { 
      query: req.query,
      ip: req.ip 
    });
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    logAuthEvent('Authentication Successful', { 
      userId: req.user?.id,
      email: req.user?.email 
    });
    res.redirect(`${process.env.CLIENT_URL}/welcome`);
  }
);

// Get authenticated user data
router.get('/user', (req, res) => {
  // Disable caching
  res.set('Cache-Control', 'no-store');

  if (req.isAuthenticated() && req.user) {
    const { id, email, display_name, picture_url } = req.user;
    logAuthEvent('User Data Requested', { userId: id });
    
    res.json({
      data: {
        authenticated: true,
        user: { 
          id, 
          email, 
          displayName: display_name, 
          pictureUrl: picture_url 
        }
      },
      status: 200,
      statusText: 'OK'
    });
  } else {
    logAuthEvent('Unauthenticated User Data Request', { authenticated: false });
    res.status(401).json({
      data: {
        authenticated: false,
        user: null
      },
      status: 401,
      statusText: 'Unauthorized'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  const userId = req.user?.id;
  logAuthEvent('Logout Initiated', { userId });

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      logAuthEvent('Logout Failed', { 
        userId,
        error: err.message 
      });
      return res.status(500).json({
        data: { error: 'Logout failed' },
        status: 500,
        statusText: 'Internal Server Error'
      });
    }

    // Clear session cookie
    res.clearCookie('sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    logAuthEvent('Logout Successful', { userId });
    res.json({
      data: { message: 'Logged out successfully' },
      status: 200,
      statusText: 'OK'
    });
  });
});

module.exports = router;