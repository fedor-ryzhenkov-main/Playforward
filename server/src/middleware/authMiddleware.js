/**
 * Enhanced authentication middleware with better error handling
 */
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Optionally refresh session expiry on activity
  if (req.session.cookie) {
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
  }

  next();
};

/**
 * Rate limiting for auth attempts
 * npm install express-rate-limit
 */
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

module.exports = { requireAuth, authLimiter }; 