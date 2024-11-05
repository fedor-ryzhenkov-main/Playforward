require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const isDevelopment = process.env.NODE_ENV !== 'production';

// In-memory user store (Use a persistent database in production)
const users = {};

// ============================
// Middleware Configuration
// ============================

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: !isDevelopment, // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure CORS
app.use(cors({
  origin: isDevelopment ? ['http://localhost:3000'] : [CLIENT_URL],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(express.json());

// ============================
// Passport Configuration
// ============================

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/youtube/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Here you would typically find or create a user in your database
    users[profile.id] = { accessToken, refreshToken, profile };
    return done(null, users[profile.id]);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.profile.id);
});

passport.deserializeUser(function(id, done) {
  const user = users[id];
  done(null, user);
});

// ============================
// Routes Configuration
// ============================

// Initiate OAuth login process
app.get('/auth/youtube',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Handle OAuth callback
app.get('/auth/youtube/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  function(req, res) {
    // Successful authentication, redirect to client.
    res.redirect(`${CLIENT_URL}/welcome`);
  }
);

// Handle authentication failure
app.get('/auth/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication Failed' });
});

// Logout route
app.get('/auth/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect(`${CLIENT_URL}/welcome`);
  });
});

/**
 * Middleware to ensure user is authenticated
 */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

/**
 * @route GET /api/user
 * @desc Get authenticated user's profile
 */
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const { profile } = req.user;
    res.json({
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      // Add other necessary fields
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

/**
 * @route POST /api/download
 * @desc Download video using yt-dlp
 */
app.post('/api/download', ensureAuthenticated, async (req, res) => {
  const { url, format } = req.body;
  
  // Basic validation
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  // Define the download format
  const downloadFormat = format || 'bestaudio';
  
  // Create a unique filename based on timestamp
  const timestamp = Date.now();
  const outputTemplate = `${timestamp}_%(title)s.%(ext)s`;
  const downloadsDir = path.join(__dirname, 'downloads');
  
  // Ensure downloads directory exists
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  
  const command = `yt-dlp -f ${downloadFormat} -o "${path.join(downloadsDir, outputTemplate)}" "${url}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing yt-dlp: ${error.message}`);
      return res.status(500).json({ error: 'Yt-dlp execution failed' });
    }
    
    // Parse stdout to find the downloaded file name
    const lines = stdout.split('\n');
    let filePath = null;
    for (let line of lines) {
      if (line.startsWith('[download] Destination:')) {
        filePath = line.replace('[download] Destination:', '').trim();
        break;
      }
    }
    
    if (!filePath) {
      console.error('Downloaded file path not found in yt-dlp output');
      return res.status(500).json({ error: 'Could not determine downloaded file path' });
    }
    
    // Send the file to the client
    res.sendFile(filePath, {}, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ error: 'Error sending file' });
      }
      
      // Clean up: delete the file after sending
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting file:', unlinkErr);
        }
      });
    });
  });
});

/**
 * @route GET /health
 * @desc Health check endpoint
 */
app.get('/health', (req, res) => {
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

// Configure downloads directory
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Accepting requests from: ${isDevelopment ? 'http://localhost:3000' : CLIENT_URL}`);
});