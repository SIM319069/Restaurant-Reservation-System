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