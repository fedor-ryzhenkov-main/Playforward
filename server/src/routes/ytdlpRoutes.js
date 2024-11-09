const express = require('express');
const YoutubeService = require('../services/ytdlpService');
const router = express.Router();

router.post('/download/init', async (req, res) => {
  const { url, metadata } = req.body;
  const userId = req.user.id;

  try {
    console.log('Initiating download for URL:', url, 'with metadata:', metadata);
    
    if (!metadata?.name) {
      throw new Error('Track name is required');
    }

    const result = await YoutubeService.initiateDownload(userId, url, metadata);
    
    console.log('Download initiation result:', result);
    
    res.json(result);
  } catch (error) {
    console.error('Download initialization error:', error);
    
    res.status(500).json({
      error: 'Download failed',
      message: error.message
    });
  }
});

router.get('/download/status', async (req, res) => {
  const userId = req.user.id;
  
  try {
    const status = await YoutubeService.getDownloadStatus(userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get download status',
      message: error.message
    });
  }
});

router.delete('/download', async (req, res) => {
  const userId = req.user.id;
  
  try {
    await YoutubeService.cleanupDownload(userId);
    res.json({ status: 'cleaned' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to cleanup download',
      message: error.message
    });
  }
});

module.exports = router; 