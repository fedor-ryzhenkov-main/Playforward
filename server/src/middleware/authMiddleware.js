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


module.exports = { requireAuth }; 