const express = require('express');
const { Pool } = require('pg');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'restaurant_reservation',
  user: process.env.DB_USER || 'restaurant_user',
  password: process.env.DB_PASSWORD || 'restaurant_pass',
});

// ==================== ADMIN ROUTES ====================

// Get admin's own restaurants
router.get('/admin/my-restaurants', requireAuth, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        r.*,
        COUNT(DISTINCT rt.id) as table_count,
        COUNT(DISTINCT res.id) as reservation_count
      FROM restaurants r
      LEFT JOIN restaurant_tables rt ON r.id = rt.restaurant_id
      LEFT JOIN reservations res ON r.id = res.restaurant_id
      WHERE r.owner_id = $1
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `;
    
    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Create new restaurant (admin only)
router.post('/admin/restaurants', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      image_url,
      opening_hours
    } = req.body;

    const query = `
      INSERT INTO restaurants (
        name, description, address, phone, email,
        owner_id, capacity, image_url, opening_hours, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      name,
      description,
      address,
      phone,
      email,
      req.user.userId,
      capacity || 50,
      image_url,
      JSON.stringify(opening_hours),
      'active'
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// Update restaurant (admin only)
router.put('/admin/restaurants/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      address,
      phone,
      email,
      capacity,
      image_url,
      opening_hours,
      status
    } = req.body;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT owner_id FROM restaurants WHERE id = $1',
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (ownerCheck.rows[0].owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own restaurants' });
    }

    const query = `
      UPDATE restaurants 
      SET name = $1, description = $2, address = $3, phone = $4,
          email = $5, capacity = $6, image_url = $7, opening_hours = $8,
          status = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      name,
      description,
      address,
      phone,
      email,
      capacity,
      image_url,
      JSON.stringify(opening_hours),
      status || 'active',
      id
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

// Get restaurant tables (admin only)
router.get('/admin/restaurants/:id/tables', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM restaurant_tables 
      WHERE restaurant_id = $1
      ORDER BY table_number
    `;

    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Add table to restaurant (admin only)
router.post('/admin/restaurants/:id/tables', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, capacity } = req.body;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT owner_id FROM restaurants WHERE id = $1',
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (ownerCheck.rows[0].owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only add tables to your own restaurants' });
    }

    const query = `
      INSERT INTO restaurant_tables (restaurant_id, table_number, capacity, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [id, table_number, capacity, 'available']);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding table:', error);
    res.status(500).json({ error: 'Failed to add table' });
  }
});

// Delete table (admin only)
router.delete('/admin/tables/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if table has any future reservations
    const reservationCheck = await pool.query(
      `SELECT COUNT(*) as count FROM reservations 
       WHERE table_id = $1 
       AND reservation_date >= CURRENT_DATE 
       AND status IN ('pending', 'confirmed')`,
      [id]
    );

    if (parseInt(reservationCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete table with active or future reservations' 
      });
    }

    const query = 'DELETE FROM restaurant_tables WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

// ==================== PUBLIC ROUTES ====================

// Get all restaurants (public)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.*,
        u.name as owner_name,
        COUNT(DISTINCT rt.id) as table_count
      FROM restaurants r
      LEFT JOIN users u ON r.owner_id = u.id
      LEFT JOIN restaurant_tables rt ON r.id = rt.restaurant_id
      WHERE r.status = 'active'
      GROUP BY r.id, u.name
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get restaurant by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        r.*,
        u.name as owner_name,
        u.email as owner_email,
        COUNT(DISTINCT rt.id) as table_count
      FROM restaurants r
      LEFT JOIN users u ON r.owner_id = u.id
      LEFT JOIN restaurant_tables rt ON r.id = rt.restaurant_id
      WHERE r.id = $1
      GROUP BY r.id, u.name, u.email
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Get available tables for booking (public/authenticated)
router.get('/:id/available-tables', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, party_size } = req.query;

    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }

    // Get all tables that can accommodate the party size
    const tablesQuery = `
      SELECT * FROM restaurant_tables
      WHERE restaurant_id = $1
      AND capacity >= $2
      AND status = 'available'
      ORDER BY capacity, table_number
    `;

    const tablesResult = await pool.query(tablesQuery, [id, party_size || 2]);

    // Filter out tables that are already booked for this time slot
    const availableTablesQuery = `
      SELECT rt.* FROM restaurant_tables rt
      WHERE rt.restaurant_id = $1
      AND rt.capacity >= $2
      AND rt.status = 'available'
      AND rt.id NOT IN (
        SELECT table_id FROM reservations
        WHERE restaurant_id = $1
        AND reservation_date = $3
        AND reservation_time = $4
        AND status IN ('pending', 'confirmed')
        AND table_id IS NOT NULL
      )
      ORDER BY rt.capacity, rt.table_number
    `;

    const result = await pool.query(availableTablesQuery, [
      id,
      party_size || 2,
      date,
      time
    ]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching available tables:', error);
    res.status(500).json({ error: 'Failed to fetch available tables' });
  }
});

// Search restaurants (public)
router.get('/search', async (req, res) => {
  try {
    const { query, cuisine, price_range } = req.query;

    let sqlQuery = `
      SELECT 
        r.*,
        COUNT(DISTINCT rt.id) as table_count
      FROM restaurants r
      LEFT JOIN restaurant_tables rt ON r.id = rt.restaurant_id
      WHERE r.status = 'active'
    `;

    const params = [];
    let paramIndex = 1;

    if (query) {
      sqlQuery += ` AND (r.name ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`;
      params.push(`%${query}%`);
      paramIndex++;
    }

    sqlQuery += ` GROUP BY r.id ORDER BY r.created_at DESC`;

    const result = await pool.query(sqlQuery, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching restaurants:', error);
    res.status(500).json({ error: 'Failed to search restaurants' });
  }
});

module.exports = router;