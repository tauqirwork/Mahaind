require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const verifyAuth = require('./middleware/verifyAuth');

const sheetRoutes = require('./routes/sheets');
const settingsRoutes = require('./routes/settings');

app.use('/api/sheets', verifyAuth, sheetRoutes);
app.use('/api/config', verifyAuth, settingsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
