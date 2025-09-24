-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    cuisine_type VARCHAR(100),
    price_range VARCHAR(20) CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    opening_hours JSONB,
    image_url TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables in restaurants
CREATE TABLE restaurant_tables (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(10) NOT NULL,
    capacity INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, table_number)
);

-- Reservations table
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);

-- Insert sample data
INSERT INTO users (google_id, email, name, role) VALUES 
('admin123', 'admin@example.com', 'System Admin', 'super_admin');

INSERT INTO restaurants (name, description, address, phone, cuisine_type, price_range, owner_id) VALUES 
('The Gourmet Corner', 'Fine dining experience with international cuisine', '123 Main St, City Center', '+1-555-0123', 'International', '$$$', 1),
('Pizza Palace', 'Authentic Italian pizza and pasta', '456 Oak Ave, Downtown', '+1-555-0124', 'Italian', '$$', 1);

INSERT INTO restaurant_tables (restaurant_id, table_number, capacity) VALUES 
(1, 'T1', 2), (1, 'T2', 4), (1, 'T3', 6), (1, 'T4', 8),
(2, 'P1', 2), (2, 'P2', 4), (2, 'P3', 6);