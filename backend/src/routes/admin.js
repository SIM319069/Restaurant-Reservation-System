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
      const today = new Date();
      let dateCondition = '';

      switch (date_filter) {
        case 'today':
          dateCondition = 'r.reservation_date = CURRENT_DATE';
          break;
        case 'tomorrow':
          dateCondition = 'r.reservation_date = CURRENT_DATE + INTERVAL \'1 day\'';
          break;
        case 'week':
          dateCondition = 'r.reservation_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL \'7 days\'';
          break;
        case 'month':
          dateCondition = 'r.reservation_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL \'30 days\'';
          break;
      }

      if (dateCondition) {
        query += ` AND ${dateCondition}`;
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
        u.phone as customer_phone,
        rest.name as restaurant_name,
        rest.address as restaurant_address,
        rest.phone as restaurant_phone,
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

// Bulk update reservation statuses
router.put('/reservations/bulk-status', async (req, res) => {
  try {
    const { reservation_ids, status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (!Array.isArray(reservation_ids) || reservation_ids.length === 0) {
      return res.status(400).json({ error: 'Invalid reservation IDs' });
    }

    const placeholders = reservation_ids.map((_, index) => `$${index + 2}`).join(',');
    const updateQuery = `
      UPDATE reservations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders})
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [status, ...reservation_ids]);

    res.json({
      updated_count: result.rows.length,
      reservations: result.rows
    });
  } catch (error) {
    console.error('Error bulk updating reservation statuses:', error);
    res.status(500).json({ error: 'Failed to bulk update reservation statuses' });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to 30 days

    const analyticsQuery = `
      SELECT 
        DATE(r.created_at) as date,
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_reservations,
        COUNT(CASE WHEN r.status = 'rejected' THEN 1 END) as rejected_reservations,
        COUNT(CASE WHEN r.status = 'cancelled' THEN 1 END) as cancelled_reservations
      FROM reservations r
      WHERE r.created_at >= CURRENT_DATE - INTERVAL '${parseInt(period)} days'
      GROUP BY DATE(r.created_at)
      ORDER BY DATE(r.created_at)
    `;

    const restaurantStatsQuery = `
      SELECT 
        rest.name as restaurant_name,
        COUNT(r.id) as total_reservations,
        COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) as confirmed_count
      FROM restaurants rest
      LEFT JOIN reservations r ON rest.id = r.restaurant_id
      WHERE r.created_at >= CURRENT_DATE - INTERVAL '${parseInt(period)} days'
      GROUP BY rest.id, rest.name
      ORDER BY total_reservations DESC
      LIMIT 10
    `;

    const [dailyStats, restaurantStats] = await Promise.all([
      pool.query(analyticsQuery),
      pool.query(restaurantStatsQuery)
    ]);

    res.json({
      daily_stats: dailyStats.rows,
      restaurant_stats: restaurantStats.rows
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;