// server/src/middleware/authMiddleware.js

const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware for authentication routes
 * Limits repeated requests to public auth endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

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

module.exports = { requireAuth, authLimiter };