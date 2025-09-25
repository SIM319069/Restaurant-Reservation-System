const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const reservationRoutes = require('./routes/reservations');
const userRoutes = require('./routes/users');

// Import passport config
require('./services/passport');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'restaurant-reservation-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});