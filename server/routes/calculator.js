const express = require('express');
const router = express.Router();
const engine = require('../services/calculatorEngine');

router.post('/calculate', (req, res) => {
  try {
    const result = engine.calculate(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
