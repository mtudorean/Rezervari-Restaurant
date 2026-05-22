const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const session   = require('express-session');
const passport  = require('passport');
require('dotenv').config();

// Configuratie Google OAuth
require('./config/passport');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiuni — necesare pentru Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Initializare Passport
app.use(passport.initialize());
app.use(passport.session());

// ── Fisiere statice (HTML, CSS, JS) ──────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Rute API ─────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/rezervari', require('./routes/rezervari.routes'));
app.use('/api/meniu',     require('./routes/meniu.routes'));
app.use('/api/recenzii',  require('./routes/recenzii.routes'));

// ── Pornire server ────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serverul ruleaza la http://localhost:${PORT}`);
});
