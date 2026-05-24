const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  getRecenziiPreparat,
  poateRecenza,
  adaugaRecenzie,
  stergeRecenzie
} = require('../controllers/recenziiController');

// Public — oricine poate citi recenziile
router.get('/:preparat_id', getRecenziiPreparat);

// Client autentificat — poate adauga/sterge propria recenzie
router.get('/poate-recenza/:preparat_id', verifyToken, poateRecenza);
router.post('/',    verifyToken, adaugaRecenzie);
router.delete('/:id', verifyToken, stergeRecenzie);

module.exports = router;
