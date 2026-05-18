const express = require('express');
const router = express.Router();
const sheetOps = require('../services/sheetOperations');
const sheetConfig = require('../config/sheetConfig');
const supabase = require('../services/supabaseClient');

const getDynamicSheetId = async (key) => {
  try {
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error || !data) return '';
    
    const configData = {};
    data.forEach(item => configData[item.key] = item.value);

    let searchKey = key;
    if (key === 'bopp' || key === 'bopp_qc') searchKey = 'lamination';
    else if (key === 'loom_qc') searchKey = 'rolldown';
    else if (key === 'liner_qc') searchKey = 'liner';
    else if (key === 'printing_qc' || key === 'printing_ink_qc') searchKey = 'printing';
    else if (key === 'bcs_qc') searchKey = 'bcs';
    else if (key === 'manual_stitch_qc') searchKey = 'baling';
    
    return configData[searchKey] || '';
  } catch (err) {
    return '';
  }
};

// Dynamic config resolution
const getConfig = async (key) => {
  const baseConfig = sheetConfig[key];
  if (!baseConfig) return null;
  const dynamicId = await getDynamicSheetId(key);
  return {
    ...baseConfig,
    spreadsheetId: dynamicId || baseConfig.spreadsheetId
  };
};

router.get('/floor-status', async (req, res) => {
  try {
    const rolldownConfig = await getConfig('rolldown');
    const balingConfig = await getConfig('baling');
    
    if (!rolldownConfig || !balingConfig) {
      return res.status(500).json({ error: 'Config missing for rolldown or baling' });
    }

    const rolldownRows = await sheetOps.getRows(rolldownConfig.spreadsheetId, rolldownConfig.tab, rolldownConfig.dataStartRow);
    const balingRows = await sheetOps.getRows(balingConfig.spreadsheetId, balingConfig.tab, balingConfig.dataStartRow);

    // Roll Down: col Y (index 24) = Issue To, col Z (index 25) = Status
    const rollsOnFloor = rolldownRows.filter(r => !r[25] || r[25].trim() === '').length;
    const rollsAtPrinting = rolldownRows.filter(r => r[24] === 'PRINTING' && r[25] === 'ISSUED').length;
    const rollsAtBOPP = rolldownRows.filter(r => r[24] === 'BOPP/LAM' && r[25] === 'ISSUED').length;

    // Baling: col J (index 9) = No. of Bale
    const totalBales = balingRows.reduce((sum, r) => sum + (parseInt(r[9]) || 0), 0);

    res.json({ rollsOnFloor, rollsAtPrinting, rollsAtBOPP, totalBales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:key/rows', async (req, res) => {
  try {
    const config = await getConfig(req.params.key);
    if (!config) return res.status(404).json({ error: 'Config not found for key' });

    const headers = await sheetOps.getHeaders(config.spreadsheetId, config.tab, config.headerRow);
    const rows = await sheetOps.getRows(config.spreadsheetId, config.tab, config.dataStartRow);
    
    res.json({ headers, rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:key/append', async (req, res) => {
  try {
    const config = await getConfig(req.params.key);
    if (!config) return res.status(404).json({ error: 'Config not found for key' });

    const { rowArray } = req.body;
    if (!rowArray || !Array.isArray(rowArray)) {
      return res.status(400).json({ error: 'rowArray is required and must be an array' });
    }

    const rowNum = await sheetOps.appendRow(config.spreadsheetId, config.tab, rowArray, config.dataStartRow);
    res.json({ success: true, rowNumber: rowNum });
  } catch (err) {
    if (err.code === 403) {
      res.status(403).json({ error: 'Sheet access denied. Check service account sharing.' });
    } else if (err.code === 429) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment and retry.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.get('/:key/row/:n', async (req, res) => {
  try {
    const config = await getConfig(req.params.key);
    if (!config) return res.status(404).json({ error: 'Config not found for key' });

    const rowNum = parseInt(req.params.n, 10);
    const row = await sheetOps.getRow(config.spreadsheetId, config.tab, rowNum);
    
    res.json({ row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
