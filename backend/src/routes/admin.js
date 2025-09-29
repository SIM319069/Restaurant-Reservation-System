// Complete Admin Routes - backend/src/routes/admin.js
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

// Apply admin middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// ==================== DASHBOARD & STATS ====================

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM reservations) as total_reservations,
        (SELECT COUNT(*) FROM reservations WHERE status = 'pending') as pending_reservations,
        (SELECT COUNT(*) FROM restaurants WHERE status = 'active') as total_restaurants,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM reservations WHERE status = 'confirmed') as confirmed_reservations,
        (SELECT COUNT(*) FROM reservations WHERE status = 'rejected') as rejected_reservations,
        (SELECT COUNT(*) FROM reservations WHERE status = 'cancelled') as cancelled_reservations
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    // Convert string numbers to integers
    Object.keys(stats).forEach(key => {
      stats[key] = parseInt(stats[key]) || 0;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ==================== RESERVATION MANAGEMENT ====================

// Get all reservations with filtering
router.get('/reservations', async (req, res) => {
  try {
    const { status, date_filter } = req.query;
    
    let query = `
      SELECT 
        r.*,
        u.name as customer_name,
        u.email as customer_email,
        u.avatar_url as customer_avatar,
        rest.name as restaurant_name,
        rest.address as restaurant_address
      FROM reservations r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Filter by status
    if (status && status !== 'all') {
      paramCount++;
      query += ` AND r.status = $${paramCount}`;
      queryParams.push(status);
    }

    // Filter by date
    if (date_filter && date_filter !== 'all') {
      switch (date_filter) {
        case 'today':
          query += ' AND r.reservation_date = CURRENT_DATE';
          break;
        case 'tomorrow':
          query += ' AND r.reservation_date = CURRENT_DATE + INTERVAL \'1 day\'';
          break;
        case 'week':
          query += ' AND r.reservation_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL \'7 days\'';
          break;
        case 'month':
          query += ' AND r.reservation_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL \'30 days\'';
          break;
      }
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Update reservation status
router.put('/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateQuery = `
      UPDATE reservations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
});

// Get reservation details
router.get('/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        r.*,
        u.name as customer_name,
        u.email as customer_email,
        u.avatar_url as customer_avatar,
        rest.name as restaurant_name,
        rest.address as restaurant_address,
        rt.table_number,
        rt.capacity as table_capacity
      FROM reservations r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching reservation details:', error);
    res.status(500).json({ error: 'Failed to fetch reservation details' });
  }
});

// ==================== RESTAURANT MANAGEMENT ====================

// Get admin's own restaurants
router.get('/my-restaurants', async (req, res) => {
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

// Create new restaurant
router.post('/restaurants', async (req, res) => {
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

// Update restaurant
router.put('/restaurants/:id', async (req, res) => {
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

// Get restaurant tables
router.get('/restaurants/:id/tables', async (req, res) => {
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

// Add table to restaurant
router.post('/restaurants/:id/tables', async (req, res) => {
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

// Delete table
router.delete('/tables/:id', async (req, res) => {
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

// ==================== ALL RESTAURANTS & USERS ====================

// Get all restaurants with additional data
router.get('/restaurants', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.*,
        u.name as owner_name,
        u.email as owner_email,
        COUNT(res.id) as reservation_count
      FROM restaurants r
      LEFT JOIN users u ON r.owner_id = u.id
      LEFT JOIN reservations res ON r.id = res.restaurant_id
      GROUP BY r.id, u.name, u.email
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get all users with additional data
router.get('/users', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.*,
        COUNT(r.id) as reservation_count
      FROM users u
      LEFT JOIN reservations r ON u.id = r.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;