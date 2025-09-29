// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  // Try multiple sources for the token
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '') || req.session?.token;

  // Also check if user is already authenticated via session (from Passport)
  if (req.user) {
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  console.log('User role:', req.user.role); // Debug log

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  // If user is admin, allow access
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user owns the resource (userId should match)
  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
  
  if (resourceUserId && req.user.userId.toString() === resourceUserId.toString()) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied. You can only access your own resources.' });
};

// Middleware to extract user info from session or JWT
const extractUser = (req, res, next) => {
  // First try to get user from session (for passport sessions)
  if (req.user) {
    return next();
  }

  // Then try to extract from JWT token
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but don't block the request
      // This allows for optional authentication
    }
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireOwnershipOrAdmin,
  extractUser
};