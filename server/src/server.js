require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure security and middleware
app.use(cors({
  origin: isDevelopment ? ['http://localhost:3000'] : [CLIENT_URL],
  credentials: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Configure downloads directory
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Validate YouTube URL
const isValidYouTubeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return ['youtube.com', 'youtu.be', 'www.youtube.com'].includes(urlObj.hostname);
  } catch {
    return false;
  }
};

app.post('/api/download', async (req, res) => {
  const { url, format = 'bestaudio' } = req.body;

  // Input validation
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidYouTubeUrl(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const outputPath = path.join(downloadsDir, '%(title)s.%(ext)s');
    const command = `yt-dlp -f ${format} "${url}" -o "${outputPath}"`;

    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Download error: ${error.message}`);
        return res.status(500).json({ error: 'Download failed', details: error.message });
      }

      // Find the downloaded file
      const files = fs.readdirSync(downloadsDir);
      const downloadedFile = files[files.length - 1]; // Get the most recent file

      if (!downloadedFile) {
        return res.status(500).json({ error: 'Downloaded file not found' });
      }

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
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Accepting requests from: ${isDevelopment ? 'http://localhost:3000' : CLIENT_URL}`);
});