// server/src/server.js
const dotenv = require('dotenv');

dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env',
});

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const morgan = require('morgan');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./db');
const { findOrCreateGoogleUser, findUserById } = require('./models/userModel');

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// Configure Morgan logging
morgan.token('user-id', (req) => req.user?.id || 'anonymous');
morgan.token('body', (req) => JSON.stringify(req.body));

// Development logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan(':method :url :status :response-time ms - :user-id :body'));
} else {
  // Production logging (less verbose)
  app.use(morgan(':method :url :status :response-time ms - :user-id'));
}

// Basic middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session',
    pruneSessionInterval: 24 * 60 * 60, // 1 day
  }),
  name: 'sid', // Custom cookie name
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'lax',
    path: '/'
  }
}));

// Configure CORS
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 600,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateGoogleUser(profile);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Simple auth check middleware
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/tracks', requireAuth, require('./routes/trackRoutes'));
app.use('/youtube', requireAuth, require('./routes/youtubeRoutes'));
app.use('/', require('./routes/basicRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});