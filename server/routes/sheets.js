const express = require('express');
const router = express.Router();
const sheetOps = require('../services/sheetOperations');
const sheetConfig = require('../config/sheetConfig');

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/sheets.json');

const getDynamicSheetId = (key) => {
  if (fs.existsSync(CONFIG_PATH)) {
    const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    // Map bopp/lamination key differences if any
    const searchKey = key === 'bopp' ? 'lamination' : key;
    return data[searchKey] || '';
  }
  return '';
};

// Dynamic config resolution
const getConfig = (key) => {
  const baseConfig = sheetConfig[key];
  if (!baseConfig) return null;
  return {
    ...baseConfig,
    spreadsheetId: getDynamicSheetId(key) || baseConfig.spreadsheetId
  };
};

router.get('/:key/rows', async (req, res) => {
  try {
    const config = getConfig(req.params.key);
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
    const config = getConfig(req.params.key);
    if (!config) return res.status(404).json({ error: 'Config not found for key' });

    const { rowArray } = req.body;
    if (!rowArray || !Array.isArray(rowArray)) {
      return res.status(400).json({ error: 'rowArray is required and must be an array' });
    }

    const rowNum = await sheetOps.appendRow(config.spreadsheetId, config.tab, rowArray);
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
    const config = getConfig(req.params.key);
    if (!config) return res.status(404).json({ error: 'Config not found for key' });

    const rowNum = parseInt(req.params.n, 10);
    const row = await sheetOps.getRow(config.spreadsheetId, config.tab, rowNum);
    
    res.json({ row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
