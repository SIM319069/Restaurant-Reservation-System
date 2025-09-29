// Reservations Routes - backend/src/routes/reservations.js
const express = require('express');
const { Pool } = require('pg');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'restaurant_reservation',
  user: process.env.DB_USER || 'restaurant_user',
  password: process.env.DB_PASSWORD || 'restaurant_pass',
});

// IMPORTANT: Apply auth middleware to all routes
router.use(requireAuth);

// Get user's reservations (authenticated)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching reservations for user:', req.user.userId); // Debug
    
    const query = `
      SELECT 
        r.*,
        rest.name as restaurant_name,
        rest.address as restaurant_address,
        rest.phone as restaurant_phone,
        rt.table_number
      FROM reservations r
      LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      WHERE r.user_id = $1
      ORDER BY r.reservation_date DESC, r.reservation_time DESC
    `;

    const result = await pool.query(query, [req.user.userId]);
    console.log('Found reservations:', result.rows.length); // Debug
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Create new reservation (authenticated)
router.post('/', async (req, res) => {
  try {
    const {
      restaurant_id,
      table_id,
      reservation_date,
      reservation_time,
      party_size,
      special_requests
    } = req.body;

    console.log('Creating reservation:', { restaurant_id, table_id, reservation_date, reservation_time, party_size }); // Debug

    // Check if table is available
    const availabilityCheck = await pool.query(
      `SELECT id FROM reservations 
       WHERE restaurant_id = $1 
       AND table_id = $2 
       AND reservation_date = $3 
       AND reservation_time = $4 
       AND status IN ('pending', 'confirmed')`,
      [restaurant_id, table_id, reservation_date, reservation_time]
    );

    if (availabilityCheck.rows.length > 0) {
      return res.status(400).json({ error: 'This table is already booked for the selected time' });
    }

    const query = `
      INSERT INTO reservations (
        user_id, restaurant_id, table_id, reservation_date, 
        reservation_time, party_size, special_requests, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      req.user.userId,
      restaurant_id,
      table_id,
      reservation_date,
      reservation_time,
      party_size,
      special_requests || null,
      'pending'
    ];

    const result = await pool.query(query, values);
    console.log('Reservation created:', result.rows[0].id); // Debug
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Get single reservation (authenticated, must be owner)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        r.*,
        rest.name as restaurant_name,
        rest.address as restaurant_address,
        rt.table_number
      FROM reservations r
      LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      WHERE r.id = $1 AND r.user_id = $2
    `;

    const result = await pool.query(query, [id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});

// Cancel reservation (authenticated, must be owner)
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE reservations 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND user_id = $2 AND status = 'pending'
      RETURNING *
    `;

    const result = await pool.query(query, [id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found or cannot be cancelled' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

module.exports = router;