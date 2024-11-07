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
const helmet = require('helmet');

const { findOrCreateGoogleUser, findUserById } = require('./models/userModel');
const trackRoutes = require('./routes/trackRoutes');
const authRoutes = require('./routes/authRoutes');

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
    tableName: 'session',
    pruneSessionInterval: 24 * 60 * 60 // 1 day
  }),
  secret: process.env.SESSION_SECRET || '0000',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: !isDevelopment, // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'lax'  // Protect against CSRF
  },
  name: 'sid'  // Change session cookie name from default 'connect.sid'
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

// Add routes
app.use(trackRoutes);
app.use(authRoutes);

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