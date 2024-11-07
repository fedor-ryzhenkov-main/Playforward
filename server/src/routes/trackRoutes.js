const express = require('express');
const { requireAuth } = require('../middleware/auth');
const trackModel = require('../models/trackModel');
const { upload } = require('../middleware/audioMiddleware');
const router = express.Router();

router.use(requireAuth);

router.post('/tracks', async (req, res) => {
  try {
    const track = await trackModel.createTrack(req.user.id, req.body);
    res.json(track);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create track' });
  }
});

router.post('/tracks/:id/audio', upload.single('audio'), async (req, res) => {
  try {
    await trackModel.saveAudio(req.params.id, req.file.buffer);
    res.json({ message: 'Audio saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save audio' });
  }
});

router.get('/tracks', async (req, res) => {
  try {
    const tracks = await trackModel.getUserTracks(req.user.id);
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

router.get('/tracks/:id', async (req, res) => {
  try {
    const track = await trackModel.getTrack(req.params.id, req.user.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    res.json(track);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

router.get('/tracks/:id/audio', async (req, res) => {
  try {
    const audio = await trackModel.getTrackAudio(req.params.id, req.user.id);
    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }
    res.send(audio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

module.exports = router; 