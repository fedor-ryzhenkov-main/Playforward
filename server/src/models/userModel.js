const db = require('../db');

async function findOrCreateGoogleUser(profile) {
  const { id: googleId, emails, displayName, photos } = profile;
  const email = emails[0].value;
  const pictureUrl = photos?.[0]?.value;

  try {
    // First try to find existing user
    const existingUser = await db.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    if (existingUser.rows[0]) {
      // Update existing user's info
      const user = await db.query(
        `UPDATE users 
         SET google_id = $1, display_name = $2, picture_url = $3
         WHERE id = $4 
         RETURNING *`,
        [googleId, displayName, pictureUrl, existingUser.rows[0].id]
      );
      return user.rows[0];
    }

    // Create new user
    const newUser = await db.query(
      `INSERT INTO users (google_id, email, display_name, picture_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [googleId, email, displayName, pictureUrl]
    );
    return newUser.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

async function findUserById(id) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = {
  findOrCreateGoogleUser,
  findUserById
}; 