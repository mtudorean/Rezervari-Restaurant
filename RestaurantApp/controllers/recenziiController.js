const db = require('../config/db');

// GET /api/recenzii/:preparat_id  (public)
const getRecenziiPreparat = async (req, res) => {
  try {
    const [recenzii] = await db.query(`
      SELECT r.*, u.nume AS nume_utilizator
      FROM recenzii r
      JOIN utilizatori u ON r.utilizator_id = u.id
      WHERE r.preparat_id = ?
      ORDER BY r.creat_la DESC
    `, [req.params.preparat_id]);
    res.json(recenzii);
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

// GET /api/recenzii/poate-recenza/:preparat_id  (client autentificat)
const poateRecenza = async (req, res) => {
  try {
    const [rezervari] = await db.query(`
      SELECT id FROM rezervari
      WHERE utilizator_id = ? AND status = 'confirmata'
      LIMIT 1
    `, [req.utilizator.id]);

    const [existenta] = await db.query(`
      SELECT id FROM recenzii
      WHERE utilizator_id = ? AND preparat_id = ?
    `, [req.utilizator.id, req.params.preparat_id]);

    res.json({
      poateRecenza: rezervari.length > 0,
      aRecenzat:    existenta.length > 0
    });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.' });
  }
};

// POST /api/recenzii  (client autentificat)
const adaugaRecenzie = async (req, res) => {
  const { preparat_id, calificativ, comentariu } = req.body;

  if (!preparat_id || !calificativ) {
    return res.status(400).json({ mesaj: 'Preparatul si calificativul sunt obligatorii.' });
  }
  if (calificativ < 1 || calificativ > 5) {
    return res.status(400).json({ mesaj: 'Calificativul trebuie sa fie intre 1 si 5.' });
  }

  try {
    // Verificam daca utilizatorul are o rezervare confirmata
    const [rezervari] = await db.query(`
      SELECT id FROM rezervari
      WHERE utilizator_id = ? AND status = 'confirmata'
      LIMIT 1
    `, [req.utilizator.id]);

    if (!rezervari.length) {
      return res.status(403).json({ mesaj: 'Poti lasa o recenzie doar dupa o vizita confirmata la restaurant.' });
    }

    // Inseram recenzia
    const [rezultat] = await db.query(`
      INSERT INTO recenzii (utilizator_id, preparat_id, calificativ, comentariu)
      VALUES (?, ?, ?, ?)
    `, [req.utilizator.id, preparat_id, calificativ, comentariu || null]);

    res.status(201).json({
      mesaj: 'Recenzie adaugata cu succes!',
      id: rezultat.insertId
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mesaj: 'Ai lasat deja o recenzie pentru acest preparat.' });
    }
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

// DELETE /api/recenzii/:id  (doar recenzia proprie)
const stergeRecenzie = async (req, res) => {
  try {
    const [recenzii] = await db.query(
      'SELECT * FROM recenzii WHERE id = ? AND utilizator_id = ?',
      [req.params.id, req.utilizator.id]
    );

    if (recenzii.length === 0) {
      return res.status(404).json({ mesaj: 'Recenzia nu a fost gasita.' });
    }

    await db.query('DELETE FROM recenzii WHERE id = ?', [req.params.id]);
    res.json({ mesaj: 'Recenzie stearsa cu succes!' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

module.exports = { getRecenziiPreparat, poateRecenza, adaugaRecenzie, stergeRecenzie };
