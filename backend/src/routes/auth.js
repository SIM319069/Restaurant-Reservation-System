const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3001/login' }),
  (req, res) => {
    console.log('OAuth callback - user:', req.user);
    
    // FIXED: Include all user fields in the JWT token
    const token = jwt.sign(
      { 
        userId: req.user.id, 
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        avatar_url: req.user.avatar_url || '' // Include avatar_url
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    console.log('Generated JWT token for redirect');
    res.redirect(`http://localhost:3001/auth/callback?token=${token}`);
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user - FIXED: Return proper user data
router.get('/user', (req, res) => {
  if (req.user) {
    // Return clean user object
    const userData = {
      id: req.user.id || req.user.userId,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      avatar_url: req.user.avatar_url
    };
    res.json(userData);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;