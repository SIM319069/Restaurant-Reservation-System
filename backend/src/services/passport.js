const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Pool } = require('pg');

// Use the new credentials from docker-compose
const pool = new Pool({
  user: 'myuser',
  host: 'postgres',
  database: 'restaurant_reservation',
  password: 'mypass',
  port: 5432,
  ssl: false
});

console.log('Initializing Passport with Google Strategy...');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  console.log('=== GOOGLE OAUTH CALLBACK ===');
  console.log('Profile ID:', profile.id);
  console.log('Profile Email:', profile.emails[0].value);
  console.log('Profile Name:', profile.displayName);
  
  try {
    console.log('🔍 Testing database connection...');
    const testResult = await pool.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ DATABASE CONNECTION SUCCESS!');
    console.log('📊 Connected to:', testResult.rows[0].db);
    console.log('⏰ Server time:', testResult.rows[0].time);
    
    // Create users table
    console.log('🔧 Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');
    
    // Check for existing user
    console.log('🔍 Looking for existing user...');
    const userQuery = 'SELECT * FROM users WHERE google_id = $1';
    const userResult = await pool.query(userQuery, [profile.id]);

    if (userResult.rows.length > 0) {
      console.log('👤 Found existing user:', userResult.rows[0].email);
      return done(null, userResult.rows[0]);
    }

    // Create new user
    console.log('🆕 Creating new user...');
    const insertQuery = `
      INSERT INTO users (google_id, email, name, avatar_url, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const newUserResult = await pool.query(insertQuery, [
      profile.id,
      profile.emails[0].value,
      profile.displayName,
      profile.photos[0]?.value || '',
      'customer'
    ]);
    
    const newUser = newUserResult.rows[0];
    console.log('🎉 SUCCESS! New user created:');
    console.log('   ID:', newUser.id);
    console.log('   Email:', newUser.email); 
    console.log('   Name:', newUser.name);
    
    return done(null, newUser);
    
  } catch (error) {
    console.error('💥 DATABASE ERROR:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Detail:', error.detail);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  console.log('📝 Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('📖 Deserializing user:', id);
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length > 0) {
      console.log('✅ User found and deserialized');
      done(null, result.rows[0]);
    } else {
      console.log('❌ User not found');
      done(new Error('User not found'), null);
    }
  } catch (error) {
    console.error('Deserialize error:', error);
    done(error, null);
  }
});

console.log('✅ Passport configuration complete');