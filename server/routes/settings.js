const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) throw error;
    
    const config = {};
    if (data) {
      data.forEach(item => {
        config[item.key] = item.value;
      });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const config = req.body;
    
    const upserts = Object.keys(config).map(key => ({
      key: key,
      value: config[key]
    }));
    
    if (upserts.length > 0) {
      const { error } = await supabase.from('app_settings').upsert(upserts, { onConflict: 'key' });
      if (error) throw error;
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
