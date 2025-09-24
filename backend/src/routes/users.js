const express = require('express');
const passport = require('passport');
const db = require('../config/database');
const router = express.Router();

// Get user profile
router.get('/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

// Update user profile
router.patch('/profile',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { name } = req.body;
      
      const result = await db.query(
        'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [name, req.user.id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all users (Admin only)
router.get('/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const result = await db.query(`
        SELECT id, email, name, role, created_at, updated_at 
        FROM users 
        ORDER BY created_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;