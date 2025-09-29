-- Complete Restaurant Booking Database Setup
-- Run this file after initial database creation

-- ==================== TABLE CREATION ====================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  opening_hours JSONB,
  capacity INTEGER DEFAULT 50,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables table
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number VARCHAR(10) NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id INTEGER REFERENCES restaurant_tables(id),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ==================== SAMPLE DATA ====================

-- Insert sample admin user
-- NOTE: You need to replace 'your-google-id' with your actual Google ID after first login
-- After you login with Google once, update this user's email to match yours and set role to 'admin'
INSERT INTO users (google_id, email, name, role, avatar_url) 
VALUES 
  ('admin-demo-001', 'admin@restaurant.com', 'Admin User', 'admin', 'https://ui-avatars.com/api/?name=Admin+User&background=2196f3&color=fff')
ON CONFLICT (google_id) DO NOTHING;

-- Insert sample customer users
INSERT INTO users (google_id, email, name, role, avatar_url) 
VALUES 
  ('customer-001', 'john.doe@example.com', 'John Doe', 'customer', 'https://ui-avatars.com/api/?name=John+Doe'),
  ('customer-002', 'jane.smith@example.com', 'Jane Smith', 'customer', 'https://ui-avatars.com/api/?name=Jane+Smith'),
  ('customer-003', 'mike.wilson@example.com', 'Mike Wilson', 'customer', 'https://ui-avatars.com/api/?name=Mike+Wilson')
ON CONFLICT (google_id) DO NOTHING;

-- Insert sample restaurants (owned by admin user)
INSERT INTO restaurants (name, description, address, phone, email, owner_id, capacity, image_url, opening_hours, status)
VALUES 
  (
    'The Golden Spoon',
    'Fine dining experience with international cuisine. Our chef brings 20 years of culinary expertise to create unforgettable meals.',
    '123 Main Street, Downtown, City, 10001',
    '+1-555-0101',
    'contact@goldenspoon.com',
    1, -- Admin user ID
    80,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    '{
      "monday": {"open": "11:00", "close": "22:00", "closed": false},
      "tuesday": {"open": "11:00", "close": "22:00", "closed": false},
      "wednesday": {"open": "11:00", "close": "22:00", "closed": false},
      "thursday": {"open": "11:00", "close": "22:00", "closed": false},
      "friday": {"open": "11:00", "close": "23:00", "closed": false},
      "saturday": {"open": "10:00", "close": "23:00", "closed": false},
      "sunday": {"open": "10:00", "close": "21:00", "closed": false}
    }'::jsonb,
    'active'
  ),
  (
    'Sakura Sushi Bar',
    'Authentic Japanese cuisine with fresh sushi and sashimi. Traditional ambiance with modern service.',
    '456 Cherry Blossom Lane, Eastside, City, 10002',
    '+1-555-0102',
    'info@sakurasushi.com',
    1, -- Admin user ID
    60,
    'https://images.unsplash.com/photo-1579027989054-b11ccc6a6ac9?w=800',
    '{
      "monday": {"open": "12:00", "close": "22:00", "closed": false},
      "tuesday": {"open": "12:00", "close": "22:00", "closed": false},
      "wednesday": {"open": "12:00", "close": "22:00", "closed": false},
      "thursday": {"open": "12:00", "close": "22:00", "closed": false},
      "friday": {"open": "12:00", "close": "23:00", "closed": false},
      "saturday": {"open": "12:00", "close": "23:00", "closed": false},
      "sunday": {"open": "12:00", "close": "21:00", "closed": false}
    }'::jsonb,
    'active'
  ),
  (
    'Mediterranean Bistro',
    'Fresh Mediterranean dishes with a modern twist. Farm-to-table ingredients and family recipes.',
    '789 Olive Garden Road, Westside, City, 10003',
    '+1-555-0103',
    'hello@medbistro.com',
    1, -- Admin user ID
    50,
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    '{
      "monday": {"open": "11:30", "close": "22:00", "closed": false},
      "tuesday": {"open": "11:30", "close": "22:00", "closed": false},
      "wednesday": {"open": "11:30", "close": "22:00", "closed": false},
      "thursday": {"open": "11:30", "close": "22:00", "closed": false},
      "friday": {"open": "11:30", "close": "23:00", "closed": false},
      "saturday": {"open": "11:00", "close": "23:00", "closed": false},
      "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'active'
  );

-- Insert sample tables for The Golden Spoon (Restaurant ID 1)
INSERT INTO restaurant_tables (restaurant_id, table_number, capacity, status)
VALUES 
  (1, '1', 2, 'available'),
  (1, '2', 2, 'available'),
  (1, '3', 4, 'available'),
  (1, '4', 4, 'available'),
  (1, '5', 4, 'available'),
  (1, '6', 6, 'available'),
  (1, '7', 6, 'available'),
  (1, '8', 8, 'available'),
  (1, 'VIP-1', 10, 'available'),
  (1, 'VIP-2', 12, 'available');

-- Insert sample tables for Sakura Sushi Bar (Restaurant ID 2)
INSERT INTO restaurant_tables (restaurant_id, table_number, capacity, status)
VALUES 
  (2, 'A1', 2, 'available'),
  (2, 'A2', 2, 'available'),
  (2, 'B1', 4, 'available'),
  (2, 'B2', 4, 'available'),
  (2, 'C1', 6, 'available'),
  (2, 'C2', 6, 'available'),
  (2, 'D1', 8, 'available'),
  (2, 'BAR-1', 10, 'available');

-- Insert sample tables for Mediterranean Bistro (Restaurant ID 3)
INSERT INTO restaurant_tables (restaurant_id, table_number, capacity, status)
VALUES 
  (3, '101', 2, 'available'),
  (3, '102', 2, 'available'),
  (3, '201', 4, 'available'),
  (3, '202', 4, 'available'),
  (3, '203', 4, 'available'),
  (3, '301', 6, 'available'),
  (3, 'PATIO-1', 8, 'available');

-- Insert sample reservations (mix of pending, confirmed, and past)
INSERT INTO reservations (user_id, restaurant_id, table_id, reservation_date, reservation_time, party_size, status, special_requests, created_at)
VALUES 
  -- Pending reservations (need admin approval)
  (2, 1, 3, CURRENT_DATE + INTERVAL '2 days', '19:00', 4, 'pending', 'Birthday celebration, need high chair', CURRENT_TIMESTAMP),
  (3, 1, 6, CURRENT_DATE + INTERVAL '3 days', '20:00', 6, 'pending', 'Anniversary dinner', CURRENT_TIMESTAMP),
  (4, 2, 11, CURRENT_DATE + INTERVAL '1 day', '18:30', 4, 'pending', 'No spicy food please', CURRENT_TIMESTAMP),
  
  -- Confirmed reservations
  (2, 1, 1, CURRENT_DATE + INTERVAL '1 day', '18:00', 2, 'confirmed', NULL, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (3, 2, 12, CURRENT_DATE + INTERVAL '4 days', '19:30', 4, 'confirmed', 'Window seat preferred', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (4, 3, 24, CURRENT_DATE + INTERVAL '5 days', '19:00', 4, 'confirmed', NULL, CURRENT_TIMESTAMP - INTERVAL '3 days'),
  
  -- Past reservations
  (2, 1, 5, CURRENT_DATE - INTERVAL '5 days', '20:00', 4, 'confirmed', NULL, CURRENT_TIMESTAMP - INTERVAL '10 days'),
  (3, 2, 13, CURRENT_DATE - INTERVAL '3 days', '19:00', 2, 'confirmed', NULL, CURRENT_TIMESTAMP - INTERVAL '7 days');

-- ==================== USEFUL QUERIES ====================

-- Query to make any user an admin (update the email):
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Query to check all users:
-- SELECT id, name, email, role FROM users;

-- Query to see all restaurants:
-- SELECT id, name, address, owner_id FROM restaurants;

-- Query to see all tables:
-- SELECT t.*, r.name as restaurant_name 
-- FROM restaurant_tables t 
-- JOIN restaurants r ON t.restaurant_id = r.id;

-- Query to see all reservations:
-- SELECT 
--   res.id,
--   u.name as customer,
--   r.name as restaurant,
--   rt.table_number,
--   res.reservation_date,
--   res.reservation_time,
--   res.party_size,
--   res.status
-- FROM reservations res
-- JOIN users u ON res.user_id = u.id
-- JOIN restaurants r ON res.restaurant_id = r.id
-- LEFT JOIN restaurant_tables rt ON res.table_id = rt.id
-- ORDER BY res.reservation_date DESC, res.reservation_time DESC;

COMMIT;