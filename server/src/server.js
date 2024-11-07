require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./db');

const { findOrCreateGoogleUser, findUserById } = require('./models/userModel');
const trackRoutes = require('./routes/trackRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'https://playforward.fedor-ryzhenkov.com';
const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================
// Middleware Configuration
// ============================

// Trust proxy if behind a reverse proxy (e.g., Nginx)
app.set('trust proxy', 1);

// Configure session middleware
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || '0000',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: !isDevelopment, // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Configure CORS
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Content-Length'],
  maxAge: 600 // Cache preflight requests for 10 minutes
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ 
  type: 'application/octet-stream',
  limit: '50mb' 
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Add after other middleware
app.use(trackRoutes);

// ============================
// Passport Configuration
// ============================

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,
    passReqToCallback: true
  },
  async function(req, accessToken, refreshToken, profile, done) {
    try {
      const user = await findOrCreateGoogleUser(profile);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize User
passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);
    if (!user) {
      return done(new Error('User not found'));
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ============================
// Authentication Routes
// ============================

/**
 * @route GET /auth/google
 * @desc Initiates Google OAuth flow
 */
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

/**
 * @route GET /auth/google/callback
 * @desc Handles the Google OAuth callback
 */
app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${CLIENT_URL}/login?error=auth_failed`,
    successRedirect: `${CLIENT_URL}/player`
  })
);

/**
 * @route GET /auth/user
 * @desc Returns the authenticated user's profile
 */
app.get('/auth/user', (req, res) => {
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
app.post('/auth/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { 
      return res.status(500).json({ error: 'Logout failed.' });
    }
    res.json({ message: 'Logged out successfully.' });
  });
});

/**
 * @route GET /api/health
 * @desc Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// ============================
// Error Handling Middleware
// ============================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================
// Server Initialization
// ============================

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Accepting requests from: ${CLIENT_URL}`);
});