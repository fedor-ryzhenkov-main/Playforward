const db = require('../db');

async function createTrack(userId, { id, name, tags, description }) {
  const result = await db.query(
    `INSERT INTO tracks (id, user_id, name, tags, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, userId, name, tags, description]
  );
  return result.rows[0];
}

async function saveAudio(trackId, audioBuffer) {
  await db.query(
    `INSERT INTO track_audio (track_id, data)
     VALUES ($1, $2)
     ON CONFLICT (track_id) 
     DO UPDATE SET data = EXCLUDED.data, last_modified = CURRENT_TIMESTAMP`,
    [trackId, audioBuffer]
  );
}

async function getTrack(trackId, userId) {
  const result = await db.query(
    'SELECT * FROM tracks WHERE id = $1 AND user_id = $2',
    [trackId, userId]
  );
  return result.rows[0];
}

async function getTrackAudio(trackId, userId) {
  const result = await db.query(
    `SELECT ta.data 
     FROM track_audio ta
     JOIN tracks t ON t.id = ta.track_id
     WHERE t.id = $1 AND t.user_id = $2`,
    [trackId, userId]
  );
  return result.rows[0]?.data;
}

async function getUserTracks(userId) {
  const result = await db.query(
    'SELECT * FROM tracks WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function searchTracksByTag(userId, tag) {
  const result = await db.query(
    'SELECT * FROM tracks WHERE user_id = $1 AND $2 = ANY(tags)',
    [userId, tag]
  );
  return result.rows;
}

async function deleteTrack(trackId, userId) {
  await db.query(
    'DELETE FROM tracks WHERE id = $1 AND user_id = $2',
    [trackId, userId]
  );
}

module.exports = {
  createTrack,
  saveAudio,
  getTrack,
  getTrackAudio,
  getUserTracks,
  searchTracksByTag,
  deleteTrack
}; 