require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Explicit CORS configuration for production (Vercel → Railway)
const allowedOrigins = [
  'https://mahaind.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Also allow any *.vercel.app preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback — tighten later if needed
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));




app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const verifyAuth = require('./middleware/verifyAuth');

const sheetRoutes = require('./routes/sheets');
const settingsRoutes = require('./routes/settings');
const calculatorRoutes = require('./routes/calculator');
const pdfRoutes = require('./routes/pdf');

const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const employeesPayrollRoutes = require('./routes/employees-payroll');
const usersRoutes = require('./routes/users');

app.use('/api/attendance', verifyAuth, attendanceRoutes);
app.use('/api/payroll', verifyAuth, payrollRoutes);
app.use('/api/employees', verifyAuth, employeesPayrollRoutes);
app.use('/api/users', verifyAuth, usersRoutes);

app.use('/api/sheets', verifyAuth, sheetRoutes);
app.use('/api/config', verifyAuth, settingsRoutes);
app.use('/api', verifyAuth, calculatorRoutes);
app.use('/api/pdf', pdfRoutes); // It uses verifyAuth inside or we can pass it here. Wait, pdf.js imports verifyAuth itself. So just mount.

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
