const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('./database');

module.exports = (passport) => {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let result = await db.query(
            'SELECT * FROM users WHERE google_id = $1',
            [profile.id]
          );

          if (result.rows.length > 0) {
            return done(null, result.rows[0]);
          }

          // Create new user
          result = await db.query(
            'INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [
              profile.id,
              profile.emails[0].value,
              profile.displayName,
              profile.photos[0].value
            ]
          );

          return done(null, result.rows[0]);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
      },
      async (payload, done) => {
        try {
          const result = await db.query(
            'SELECT * FROM users WHERE id = $1',
            [payload.id]
          );

          if (result.rows.length > 0) {
            return done(null, result.rows[0]);
          }

          return done(null, false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};