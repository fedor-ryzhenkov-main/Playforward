const { Pool } = require('pg');

console.log('Initializing database connection...');
console.log('DATABASE_URL format:', process.env.DATABASE_URL ? 'Present' : 'Missing');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: process.env.CA_CERT,
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED
  }
});


// Add more detailed error handling
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  console.error('Error code:', err.code);
  console.error('Error stack:', err.stack);
  process.exit(-1);
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client:', err.stack);
    console.error('Connection details:', {
      host: pool.options.host,
      port: pool.options.port,
      database: pool.options.database,
      user: pool.options.user,
      ssl: pool.options.ssl
    });
    return;
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Database connection successful:', result.rows[0]);
  });
});

module.exports = {
  query: (text, params) => {
    console.log('Executing query:', text);
    return pool.query(text, params)
      .catch(err => {
        console.error('Query error:', err);
        throw err;
      });
  },
}; 