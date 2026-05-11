const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/sheets.json');

router.get('/', async (req, res) => {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return res.json({});
    }
    const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
