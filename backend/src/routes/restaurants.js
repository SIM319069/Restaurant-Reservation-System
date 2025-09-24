const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const router = express.Router();

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const { cuisine, price_range, search } = req.query;
    let query = `
      SELECT r.*, u.name as owner_name 
      FROM restaurants r 
      LEFT JOIN users u ON r.owner_id = u.id 
      WHERE r.is_active = true
    `;
    const params = [];

    if (cuisine) {
      query += ` AND r.cuisine_type ILIKE $${params.length + 1}`;
      params.push(`%${cuisine}%`);
    }

    if (price_range) {
      query += ` AND r.price_range = $${params.length + 1}`;
      params.push(price_range);
    }

    if (search) {
      query += ` AND (r.name ILIKE $${params.length + 1} OR r.description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, u.name as owner_name,
        json_agg(
          json_build_object(
            'id', rt.id,
            'table_number', rt.table_number,
            'capacity', rt.capacity,
            'is_available', rt.is_available
          )
        ) as tables
      FROM restaurants r 
      LEFT JOIN users u ON r.owner_id = u.id 
      LEFT JOIN restaurant_tables rt ON r.id = rt.restaurant_id
      WHERE r.id = $1 AND r.is_active = true
      GROUP BY r.id, u.name
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create restaurant (Admin only)
router.post('/', 
  passport.authenticate('jwt', { session: false }),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('cuisine_type').notEmpty().withMessage('Cuisine type is required'),
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

      const {
        name, description, address, phone, email,
        cuisine_type, price_range, opening_hours, image_url
      } = req.body;

      const result = await db.query(`
        INSERT INTO restaurants 
        (name, description, address, phone, email, cuisine_type, price_range, opening_hours, image_url, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        name, description, address, phone, email,
        cuisine_type, price_range, opening_hours, image_url, req.user.id
      ]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;