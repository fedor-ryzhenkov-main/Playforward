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
// OAuth Configuration
// ============================

// Configure Passport with Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Set in .env
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Set in .env
    callbackURL: "/auth/youtube/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // Store user tokens securely
    users[profile.id] = {
      profile,
      accessToken,
      refreshToken
    };
    return cb(null, users[profile.id]);
  }
));

// Serialize user for session
passport.serializeUser((user, cb) => {
  cb(null, user.profile.id);
});

// Deserialize user from session
passport.deserializeUser((id, cb) => {
  const user = users[id];
  if (user) {
    cb(null, user);
  } else {
    cb(new Error('User not found'), null);
  }
});

// ============================
// Utility Functions
// ============================

/**
 * Validates if the provided URL is a valid YouTube URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - Returns true if valid, else false.
 */
const isValidYouTubeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const validHosts = ['youtube.com', 'youtu.be', 'www.youtube.com'];
    return validHosts.includes(urlObj.hostname);
  } catch {
    return false;
  }
};

/**
 * Refreshes the OAuth access token using the refresh token.
 * @param {Object} user - The authenticated user object.
 * @returns {Promise<string>} - Returns the new access token.
 */
const refreshAccessToken = async (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: user.refreshToken
  });

  try {
    const tokens = await oauth2Client.getAccessToken();
    user.accessToken = tokens.token;
    // Update the user store with the new access token
    users[user.profile.id] = user;
    return tokens.token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Failed to refresh access token');
  }
};

/**
 * Middleware to ensure the user is authenticated.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'User not authenticated' });
};

// ============================
// OAuth Routes
// ============================

/**
 * @route GET /auth/youtube
 * @desc Initiates OAuth flow with Google
 */
app.get('/auth/youtube',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/youtube.readonly'], accessType: 'offline', prompt: 'consent' })
);

/**
 * @route GET /auth/youtube/callback
 * @desc Handles OAuth callback and redirects user
 */
app.get('/auth/youtube/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // Successful authentication, redirect to client application
    res.redirect(CLIENT_URL);
  }
);

/**
 * @route GET /auth/failure
 * @desc Handles authentication failures
 */
app.get('/auth/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication Failed' });
});

/**
 * @route GET /auth/logout
 * @desc Logs out the user and destroys the session
 */
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(CLIENT_URL);
  });
});

// ============================
// API Routes
// ============================

/**
 * @route POST /download
 * @desc Downloads audio from a YouTube video using yt-dlp with OAuth authorization
 * @access Protected
 */
app.post('/download', ensureAuthenticated, async (req, res) => {
  const { url, format = 'bestaudio' } = req.body;
  let user = req.user;

  // Input validation
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidYouTubeUrl(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    // Refresh access token if necessary
    await refreshAccessToken(user);

    const outputTemplate = path.join(downloadsDir, '%(title)s.%(ext)s');

    // Prepare extractor arguments with refreshed OAuth token
    const extractorArgs = `--username=oauth --password="" --extractor-args "youtube:player-client=web,default;oauth_access_token=${user.accessToken}"`;

    const command = `yt-dlp -f ${format} ${extractorArgs} "${url}" -o "${outputTemplate}"`;

    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Download error: ${error.message}`);
        return res.status(500).json({ error: 'Download failed', details: error.message });
      }

      // Find the downloaded file
      fs.readdir(downloadsDir, (readErr, files) => {
        if (readErr) {
          console.error('Error reading downloads directory:', readErr);
          return res.status(500).json({ error: 'Unable to access downloads directory' });
        }

        if (files.length === 0) {
          return res.status(500).json({ error: 'No files found after download' });
        }

        // Assume the last modified file is the downloaded file
        const sortedFiles = files.map(file => ({
          name: file,
          time: fs.statSync(path.join(downloadsDir, file)).mtime.getTime()
        })).sort((a, b) => b.time - a.time);

        const downloadedFile = sortedFiles[0].name;
        const filePath = path.join(downloadsDir, downloadedFile);

        // Determine MIME type based on file extension
        const mimeType = downloadedFile.endsWith('.mp3') ? 'audio/mpeg' : 'application/octet-stream';

        // Set response headers
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${downloadedFile}"`);

        // Send file and clean up
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
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
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