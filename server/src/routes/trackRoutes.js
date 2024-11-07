const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const trackModel = require('../models/trackModel');
const { upload } = require('../middleware/audioMiddleware');
const router = express.Router();

router.use(requireAuth);

router.post('/tracks', async (req, res) => {
  try {
    const track = await trackModel.createTrack(req.user.id, req.body);
    res.json({
      data: track,
      status: 200,
      statusText: 'OK'
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      status: 500,
      statusText: 'Failed to create track'
    });
  }
});

router.post('/tracks/:id/audio', upload.single('audio'), async (req, res) => {
  try {
    await trackModel.saveAudio(req.params.id, req.file.buffer);
    res.json({
      data: null,
      status: 200,
      statusText: 'OK'
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      status: 500,
      statusText: 'Failed to save audio'
    });
  }
});

router.get('/tracks', async (req, res) => {
  try {
    const tracks = await trackModel.getUserTracks(req.user.id);
    res.json({
      data: tracks,
      status: 200,
      statusText: 'OK'
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      status: 500,
      statusText: 'Failed to fetch tracks'
    });
  }
});

router.get('/tracks/:id', async (req, res) => {
  try {
    const track = await trackModel.getTrack(req.params.id, req.user.id);
    if (!track) {
      return res.status(404).json({
        data: null,
        status: 404,
        statusText: 'Track not found'
      });
    }
    res.json({
      data: track,
      status: 200,
      statusText: 'OK'
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      status: 500,
      statusText: 'Failed to fetch track'
    });
  }
});

router.delete('/tracks/:id', async (req, res) => {
  try {
    await trackModel.deleteTrack(req.params.id, req.user.id);
    res.json({
      data: null,
      status: 200,
      statusText: 'OK'
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      status: 500,
      statusText: 'Failed to delete track'
    });
  }
});

router.get('/tracks/:id/audio', async (req, res) => {
  try {
    const audio = await trackModel.getTrackAudio(req.params.id, req.user.id);
    if (!audio) {
      return res.status(404).json({
        data: null,
        status: 404,
        statusText: 'Audio not found'
      });
    }
    res.send(audio);
  } catch (error) {
    res.status(500).json({
      data: null,
      status: 500,
      statusText: 'Failed to fetch audio'
    });
  }
});

router.put('/tracks/:id', async (req, res) => {
  try {
    const track = await trackModel.updateTrack(req.params.id, req.user.id, req.body);
    res.json({
      data: track,
      status: 200,
      statusText: 'OK'
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      status: 500,
      statusText: 'Failed to update track'
    });
  }
});

module.exports = router;