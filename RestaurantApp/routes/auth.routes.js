const express  = require('express');
const router   = express.Router();
const passport = require('passport');
const jwt      = require('jsonwebtoken');

const { register, login, schimbaParola } = require('../controllers/authController');
const { verifyToken } = require('../middleware/verifyToken');

// ── Rute normale ──────────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// 1. Redirect catre Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2. Callback dupa autentificare Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html?error=google' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, rol: req.user.rol, nume: req.user.nume },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '24h' }
    );

    res.redirect(
      `/auth-success.html?token=${token}&nume=${encodeURIComponent(req.user.nume)}&email=${encodeURIComponent(req.user.email)}&rol=${req.user.rol}&id=${req.user.id}`
    );
  }
);

// Ruta pentru schimbarea parolei (acum va funcționa pentru că am importat funcția sus)
router.put('/schimba-parola', verifyToken, schimbaParola);

module.exports = router;
