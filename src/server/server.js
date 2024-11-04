const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

app.post('/api/download', async (req, res) => {
  const { url, format = 'bestaudio' } = req.body;

  try {
    const outputPath = path.join(downloadsDir, '%(title)s.%(ext)s');
    exec(`yt-dlp -f ${format} "${url}" -o "${outputPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        return res.status(500).json({ error: error.message });
      }

      // Find the downloaded file
      const files = fs.readdirSync(downloadsDir);
      const downloadedFile = files[files.length - 1]; // Get the most recent file

      if (downloadedFile) {
        const filePath = path.join(downloadsDir, downloadedFile);
        // Determine MIME type based on file extension
        const mimeType = downloadedFile.endsWith('.mp3') ? 'audio/mpeg' : 'application/octet-stream';

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${downloadedFile}"`);
        res.sendFile(filePath, {}, (err) => {
          if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error sending file');
          }
          // Clean up: delete the file after sending
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting file:', unlinkErr);
            }
          });
        });
      } else {
        res.status(500).json({ error: 'Downloaded file not found' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});