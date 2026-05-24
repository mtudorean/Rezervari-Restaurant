const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// POST /api/auth/register
const register = async (req, res) => {
  // Am adăugat 'rol' în destructurare (opțional, dacă vrei să-l trimiți din formular)
  const { nume, email, parola, rol } = req.body;

  if (!nume || !email || !parola) {
    return res.status(400).json({ mesaj: 'Toate campurile sunt obligatorii.' });
  }

  try {
    // 1. Verificam daca email-ul exista deja
    const [existent] = await db.query(
      'SELECT id FROM utilizatori WHERE email = ?', [email]
    );
    
    if (existent.length > 0) {
      return res.status(409).json({ mesaj: 'Acest email este deja inregistrat.' });
    }

    // 2. Hash parola folosind bcryptjs
    const parolaHash = await bcrypt.hash(parola, 10);

    // 3. Salvam utilizatorul (Am adăugat coloana 'rol' și 'creat_la')
    // Dacă 'rol' nu este trimis, punem implicit 'client'
    const [rezultat] = await db.query(
      'INSERT INTO utilizatori (nume, email, parola, rol, creat_la) VALUES (?, ?, ?, ?, NOW())',
      [nume, email, parolaHash, rol || 'client']
    );

    res.status(201).json({
      mesaj: 'Cont creat cu succes!',
      id: rezultat.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, parola } = req.body;

  if (!email || !parola) {
    return res.status(400).json({ mesaj: 'Email si parola sunt obligatorii.' });
  }

  try {
    // 1. Cautam utilizatorul
    const [utilizatori] = await db.query(
      'SELECT * FROM utilizatori WHERE email = ?', [email]
    );
    
    if (utilizatori.length === 0) {
      return res.status(401).json({ mesaj: 'Email sau parola incorecte.' });
    }

    const utilizator = utilizatori[0];

    // 2. Verificam parola folosind bcryptjs
    const parolaCorecta = await bcrypt.compare(parola, utilizator.parola);
    if (!parolaCorecta) {
      return res.status(401).json({ mesaj: 'Email sau parola incorecte.' });
    }

    // 3. Generam token JWT
    const token = jwt.sign(
      { id: utilizator.id, rol: utilizator.rol, nume: utilizator.nume },
      process.env.JWT_SECRET || 'secret_cheie_temporara', 
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    res.json({
      mesaj: 'Autentificare reusita!',
      token,
      utilizator: {
        id:    utilizator.id,
        nume:  utilizator.nume,
        email: utilizator.email,
        rol:   utilizator.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

// PUT /api/auth/schimba-parola
const schimbaParola = async (req, res) => {
  const { parola_actuala, parola_noua } = req.body;
 
  if (!parola_actuala || !parola_noua) {
    return res.status(400).json({ mesaj: 'Toate campurile sunt obligatorii.' });
  }
  if (parola_noua.length < 6) {
    return res.status(400).json({ mesaj: 'Parola noua trebuie sa aiba cel putin 6 caractere.' });
  }
 
  try {
    const [utilizatori] = await db.query(
      'SELECT * FROM utilizatori WHERE id = ?', [req.utilizator.id]
    );
    const utilizator = utilizatori[0];
 
    // Verificam parola actuala (nu se aplica pentru conturi Google OAuth)
    if (utilizator.parola !== 'GOOGLE_OAUTH') {
      const corecta = await bcrypt.compare(parola_actuala, utilizator.parola);
      if (!corecta) {
        return res.status(401).json({ mesaj: 'Parola actuala este incorecta.' });
      }
    }
 
    const parolaHash = await bcrypt.hash(parola_noua, 10);
    await db.query('UPDATE utilizatori SET parola = ? WHERE id = ?', [parolaHash, req.utilizator.id]);
 
    res.json({ mesaj: 'Parola a fost schimbata cu succes!' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};
 
// Exportăm TOATE cele 3 funcții printr-un singur obiect curat
module.exports = { register, login, schimbaParola };