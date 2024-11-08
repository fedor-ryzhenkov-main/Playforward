const express = require('express');
const passport = require('passport');
const router = express.Router();
const { authLimiter } = require('../middleware/authMiddleware');

// Apply rate limiting to auth routes
router.use('/auth', authLimiter);

// Add a session check endpoint
router.get('/auth/check', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const { id, email, display_name, picture_url } = req.user;
    res.json({
      authenticated: true,
      user: {
        id,
        email,
        displayName: display_name,
        pictureUrl: picture_url
      }
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

const CLIENT_URL = process.env.CLIENT_URL || 'https://playforward.fedor-ryzhenkov.com';

/**
 * @route GET /auth/google
 * @desc Initiates Google OAuth flow
 */
router.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

/**
 * @route GET /auth/google/callback
 * @desc Handles the Google OAuth callback
 */
router.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${CLIENT_URL}/login?error=auth_failed`,
    successRedirect: `${CLIENT_URL}/player`
  })
);

/**
 * @route GET /auth/user
 * @desc Returns the authenticated user's profile
 */
router.get('/auth/user', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const { id, email, display_name, picture_url, created_at } = req.user;
    res.json({
      id,
      email,
      displayName: display_name,
      pictureUrl: picture_url,
      createdAt: created_at
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

/**
 * @route POST /auth/logout
 * @desc Logs out the current user
 */
router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('sid');  // Clear the session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router; 