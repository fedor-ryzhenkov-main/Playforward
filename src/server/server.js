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
    exec(`yt-dlp -f ${format} "${url}" -o "${outputPath}"`, 
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`);
          return res.status(500).json({ error: error.message });
        }
        // Find the downloaded file
        const files = fs.readdirSync(downloadsDir);
        const downloadedFile = files[files.length - 1]; // Get the most recent file
        
        if (downloadedFile) {
          const filePath = path.join(downloadsDir, downloadedFile);
          res.sendFile(filePath, {}, (err) => {
            if (err) {
              console.error('Error sending file:', err);
            }
            // Clean up: delete the file after sending
            fs.unlinkSync(filePath);
          });
        } else {
          res.status(500).json({ error: 'Downloaded file not found' });
        }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});