// ── Adauga aceasta functie in authController.js ──────────────
// si adauga ruta in auth.routes.js:
// router.put('/schimba-parola', verifyToken, schimbaParola);

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

module.exports = { register, login, schimbaParola };
