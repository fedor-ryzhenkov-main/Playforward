const express = require('express');
const YoutubeService = require('../services/ytdlpService');
const router = express.Router();

router.post('/download/init', async (req, res) => {
  const { url } = req.body;
  const userId = '0000'; // TODO: Get actual user ID from auth

  try {
    console.log('Initiating download for URL:', url); // Debug logging
    
    const result = await YoutubeService.initiateDownload(userId, url);
    
    console.log('Download initiation result:', result); // Debug logging
    
    res.json(result);
  } catch (error) {
    console.error('Download initialization error:', error); // Debug logging
    
    res.status(500).json({
      error: 'Download failed',
      message: error.message
    });
  }
});

router.get('/download/status', (req, res) => {
  const userId = '0000';
  
  try {
    const status = YoutubeService.getDownloadStatus(userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get download status',
      message: error.message
    });
  }
});

router.delete('/download', (req, res) => {
  const userId = '0000';
  
  try {
    YoutubeService.cleanupDownload(userId);
    res.json({ status: 'cleaned' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to cleanup download',
      message: error.message
    });
  }
});

module.exports = router; 