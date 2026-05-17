require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
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

app.use('/api/attendance', verifyAuth, attendanceRoutes);
app.use('/api/payroll', verifyAuth, payrollRoutes);
app.use('/api/employees', verifyAuth, employeesPayrollRoutes);

app.use('/api/sheets', verifyAuth, sheetRoutes);
app.use('/api/config', verifyAuth, settingsRoutes);
app.use('/api', verifyAuth, calculatorRoutes);
app.use('/api/pdf', pdfRoutes); // It uses verifyAuth inside or we can pass it here. Wait, pdf.js imports verifyAuth itself. So just mount.

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
