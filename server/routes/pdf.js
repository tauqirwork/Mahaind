const express = require('express');
const router = express.Router();
const verifyAuth = require('../middleware/verifyAuth');
const { generatePDFFromHTML } = require('../services/pdfGenerator');
const fs = require('fs');
const path = require('path');

const COMPANY_CONFIG = {
  name: 'Mahaind Overseas Pvt Ltd',
  address: 'Bhairat Patil Industrial Park, Gat No. 537 & 538, Badhalwadi (Navlakh Umbre), Taluka: Maval, Dist: Pune – 410507, Maharashtra',
  gstin: '27AAQCM7594N1ZA',
  msmeNo: 'UDYAM-MH-26-0458799',
  phone: '',
  email: '',
  website: '',
  tagline: 'Manufacturing & Trading',
  bankDetails: { bank: '', account: '', ifsc: '', branch: '' },
  logoPath: path.join(__dirname, '../assets/logo.png')
};

function getLogoBase64() {
  try {
    if (fs.existsSync(COMPANY_CONFIG.logoPath)) {
      const ext = path.extname(COMPANY_CONFIG.logoPath).toLowerCase().substring(1);
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
      const fileData = fs.readFileSync(COMPANY_CONFIG.logoPath);
      return `data:${mime};base64,${fileData.toString('base64')}`;
    }
  } catch (err) {
    console.error('Failed to read logo:', err);
  }
  return null;
}

// Optional: Endpoint for frontend to fetch the config (if needed)
router.get('/config', (req, res) => {
  const config = { ...COMPANY_CONFIG, logoBase64: getLogoBase64() };
  delete config.logoPath;
  res.json(config);
});

router.post('/generate', async (req, res) => {
  try {
    let { html, data } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Fix 1: Inject logo base64 if placeholders exist (frontend might send placeholder or we inject it)
    const logoBase64 = getLogoBase64();
    if (logoBase64) {
      html = html.replace(/<!--LOGO_BASE64-->|\/assets\/logo\.png|LOGO_BASE64_PLACEHOLDER/g, logoBase64);
    }

    // Fix 2: Allow frontend to supply its own CSS including Tailwind
    let cleanHtml = html;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        ${cleanHtml}
      </body>
      </html>
    `;

    const pdfBuffer = await generatePDFFromHTML(fullHtml);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fix 6: Google Sheets integration endpoints using existing sheetOperations service
const sheetOperations = require('../services/sheetOperations');

router.get('/buyers', async (req, res) => {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const tab = process.env.SHEET_BUYERS_TAB || 'Buyers';

  if (!sheetId) {
    return res.json([
      { name: 'MOCK BUYER CORP', gstin: '27MOCK1234A1Z5', address: '123 Mock Street', state: 'Maharashtra', stateCode: '27', phone: '9876543210', email: 'mock@buyer.com' }
    ]);
  }

  try {
    const rows = await sheetOperations.getRows(sheetId, tab, 1);
    if (!rows || rows.length === 0) return res.json([]);
    
    const rawHeaders = rows[0];
    // Create a normalized mapping to ensure case-insensitivity and ignore spaces
    const headers = rawHeaders.map(h => {
      const key = (h || '').toString().toLowerCase().replace(/\s+/g, '');
      if (key === 'statecode') return 'stateCode';
      if (key === 'contactperson') return 'contactPerson';
      if (key === 'shippingaddress') return 'shippingAddress';
      return key;
    });

    const buyers = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || '');
      return obj;
    });

    res.json(buyers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products', async (req, res) => {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const tab = process.env.SHEET_PRODUCTS_TAB || 'Products';

  if (!sheetId) {
    return res.json([
      { name: 'MOCK PRODUCT A', description: 'Mock Description', hsnCode: '123456', unit: 'Nos', defaultRate: '100', gstRate: '18', category: 'Packaging', cgst: 9, sgst: 9 }
    ]);
  }

  try {
    const rows = await sheetOperations.getRows(sheetId, tab, 1);
    if (!rows || rows.length === 0) return res.json([]);
    
    const rawHeaders = rows[0];
    const headers = rawHeaders.map(h => {
      const key = (h || '').toString().toLowerCase().replace(/\s+/g, '');
      if (key === 'hsncode') return 'hsnCode';
      if (key === 'defaultrate') return 'defaultRate';
      if (key === 'gstrate') return 'gstRate';
      return key;
    });

    const products = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || '');
      const gstRate = parseFloat(obj.gstRate || 0);
      obj.cgst = gstRate / 2;
      obj.sgst = gstRate / 2;
      return obj;
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
