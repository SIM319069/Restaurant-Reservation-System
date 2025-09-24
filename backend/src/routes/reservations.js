const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const router = express.Router();

// Get user's reservations
router.get('/my-reservations',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const result = await db.query(`
        SELECT 
          res.*,
          r.name as restaurant_name,
          r.address as restaurant_address,
          rt.table_number
        FROM reservations res
        JOIN restaurants r ON res.restaurant_id = r.id
        JOIN restaurant_tables rt ON res.table_id = rt.id
        WHERE res.user_id = $1
        ORDER BY res.reservation_date DESC, res.reservation_time DESC
      `, [req.user.id]);

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Create reservation
router.post('/',
  passport.authenticate('jwt', { session: false }),
  [
    body('restaurant_id').isInt().withMessage('Restaurant ID is required'),
    body('table_id').isInt().withMessage('Table ID is required'),
    body('reservation_date').isDate().withMessage('Valid date is required'),
    body('reservation_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required'),
    body('party_size').isInt({ min: 1, max: 20 }).withMessage('Party size must be between 1 and 20'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        restaurant_id, table_id, reservation_date,
        reservation_time, party_size, special_requests
      } = req.body;

      // Check if table is available
      const conflictCheck = await db.query(`
        SELECT * FROM reservations 
        WHERE table_id = $1 
        AND reservation_date = $2 
        AND reservation_time = $3 
        AND status NOT IN ('rejected', 'cancelled')
      `, [table_id, reservation_date, reservation_time]);

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({ message: 'Table is not available at this time' });
      }

      // Check table capacity
      const tableCheck = await db.query(
        'SELECT capacity FROM restaurant_tables WHERE id = $1',
        [table_id]
      );

      if (tableCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Table not found' });
      }

      if (party_size > tableCheck.rows[0].capacity) {
        return res.status(400).json({ 
          message: `Party size exceeds table capacity of ${tableCheck.rows[0].capacity}` 
        });
      }

      const result = await db.query(`
        INSERT INTO reservations 
        (user_id, restaurant_id, table_id, reservation_date, reservation_time, party_size, special_requests)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [req.user.id, restaurant_id, table_id, reservation_date, reservation_time, party_size, special_requests]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update reservation status (Admin only)
router.patch('/:id/status',
  passport.authenticate('jwt', { session: false }),
  [
    body('status').isIn(['pending', 'confirmed', 'rejected', 'cancelled', 'completed'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const result = await db.query(
        'UPDATE reservations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [req.body.status, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;