const db = require('../config/db');

const getToateRezervariле = async (req, res) => {
  try {
    const [rezervari] = await db.query(`
      SELECT r.*, u.nume AS nume_client, u.email,
             m.numar AS numar_masa, m.locatie
      FROM rezervari r
      JOIN utilizatori u ON r.utilizator_id = u.id
      JOIN mese m        ON r.masa_id = m.id
      ORDER BY r.data DESC, r.ora DESC
    `);
    res.json(rezervari);
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

const getRezervariUtilizator = async (req, res) => {
  try {
    const [rezervari] = await db.query(`
      SELECT r.*, m.numar AS numar_masa, m.locatie
      FROM rezervari r
      JOIN mese m ON r.masa_id = m.id
      WHERE r.utilizator_id = ?
      ORDER BY r.data DESC, r.ora DESC
    `, [req.utilizator.id]);
    res.json(rezervari);
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

const creeazaRezervare = async (req, res) => {
  const { masa_id, data, ora, nr_persoane, observatii } = req.body;

  if (!masa_id || !data || !ora || !nr_persoane) {
    return res.status(400).json({ mesaj: 'Campurile masa, data, ora si nr_persoane sunt obligatorii.' });
  }

  try {
    const [conflict] = await db.query(`
      SELECT id FROM rezervari
      WHERE masa_id = ? AND data = ? AND ora = ?
      AND status IN ('confirmata', 'in_asteptare')
    `, [masa_id, data, ora]);

    if (conflict.length > 0) {
      return res.status(409).json({ mesaj: 'Masa este deja rezervata la aceasta data si ora.' });
    }

    const [rezultat] = await db.query(`
      INSERT INTO rezervari (utilizator_id, masa_id, data, ora, nr_persoane, observatii)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.utilizator.id, masa_id, data, ora, nr_persoane, observatii || null]);

    res.status(201).json({
      mesaj: 'Rezervare creata cu succes!',
      id: rezultat.insertId
    });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

const actualizeazaStatus = async (req, res) => {
  const { status } = req.body;
  const statusuriValide = ['in_asteptare', 'confirmata', 'anulata'];

  if (!statusuriValide.includes(status)) {
    return res.status(400).json({ mesaj: 'Status invalid.' });
  }

  try {
    await db.query(
      'UPDATE rezervari SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ mesaj: 'Status actualizat cu succes!' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

const anuleazaRezervare = async (req, res) => {
  try {
    const [rezervari] = await db.query(
      'SELECT * FROM rezervari WHERE id = ? AND utilizator_id = ?',
      [req.params.id, req.utilizator.id]
    );

    if (rezervari.length === 0) {
      return res.status(404).json({ mesaj: 'Rezervarea nu a fost gasita.' });
    }

    await db.query(
      "UPDATE rezervari SET status = 'anulata' WHERE id = ?",
      [req.params.id]
    );
    res.json({ mesaj: 'Rezervare anulata cu succes!' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

const getMeseDisponibile = async (req, res) => {
  const { data, ora } = req.query;

  if (!data || !ora) {
    return res.status(400).json({ mesaj: 'Data si ora sunt obligatorii.' });
  }

  try {
    const [mese] = await db.query(`
      SELECT * FROM mese
      WHERE este_activa = TRUE
      AND id NOT IN (
        SELECT masa_id FROM rezervari
        WHERE data = ? AND ora = ? AND status IN ('confirmata', 'in_asteptare')
      )
      ORDER BY numar
    `, [data, ora]);
    res.json(mese);
  } catch (err) {
    res.status(500).json({ mesaj: 'Eroare server.', eroare: err.message });
  }
};

module.exports = {
  getToateRezervariле,
  getRezervariUtilizator,
  creeazaRezervare,
  actualizeazaStatus,
  anuleazaRezervare,
  getMeseDisponibile
};