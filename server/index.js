const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddleware');

const tapelineRoutes = require('./routes/tapeline');
const rolldownRoutes = require('./routes/rolldown');
const linerRoutes = require('./routes/liner');
const printingRoutes = require('./routes/printing');
const boppRoutes = require('./routes/bopp');
const bcsRoutes = require('./routes/bcs');
const balingRoutes = require('./routes/baling');
const bagmasterRoutes = require('./routes/bagmaster');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', process.env.PRODUCTION_DOMAIN] }));

// Apply auth middleware to all /api/v1/ routes
app.use('/api/v1', authMiddleware);

app.use('/api/v1/tapeline', tapelineRoutes);
app.use('/api/v1/rolldown', rolldownRoutes);
app.use('/api/v1/liner', linerRoutes);
app.use('/api/v1/printing', printingRoutes);
app.use('/api/v1/bopp', boppRoutes);
app.use('/api/v1/bcs', bcsRoutes);
app.use('/api/v1/baling', balingRoutes);
app.use('/api/v1/bagmaster', bagmasterRoutes);
app.use('/api/v1/settings', settingsRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
