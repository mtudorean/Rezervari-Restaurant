const passport      = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db            = require('./db');
const jwt           = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  'http://localhost:3000/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const nume  = profile.displayName;

    // Verificam daca utilizatorul exista deja
    const [existenti] = await db.query(
      'SELECT * FROM utilizatori WHERE email = ?', [email]
    );

    let utilizator;

    if (existenti.length > 0) {
      // Utilizatorul exista — il returnam
      utilizator = existenti[0];
    } else {
      // Utilizatorul nu exista — il cream automat
      const [rezultat] = await db.query(
        'INSERT INTO utilizatori (nume, email, parola, rol) VALUES (?, ?, ?, ?)',
        [nume, email, 'GOOGLE_OAUTH', 'client']
      );
      utilizator = { id: rezultat.insertId, nume, email, rol: 'client' };
    }

    return done(null, utilizator);
  } catch (err) {
    return done(err, null);
  }
}));

// Serializare / Deserializare sesiune
passport.serializeUser((utilizator, done) => {
  done(null, utilizator.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [utilizatori] = await db.query(
      'SELECT id, nume, email, rol FROM utilizatori WHERE id = ?', [id]
    );
    done(null, utilizatori[0]);
  } catch (err) {
    done(err, null);
  }
});
