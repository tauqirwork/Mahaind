const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const { summarizeAttendance } = require('../services/attendanceSummary');

// GET /api/attendance/:employeeId/:month/:year
router.get('/:employeeId/:month/:year', async (req, res) => {
  const { employeeId, month, year } = req.params;
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate);
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/summary/:month/:year
router.get('/summary/:month/:year', async (req, res) => {
  const { month, year } = req.params;
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
      
    if (error) throw error;
    
    // Group by employee and summarize
    const summaryByEmployee = {};
    const employees = [...new Set(data.map(d => d.employee_id))];
    
    for (const emp of employees) {
        const empRecords = data.filter(d => d.employee_id === emp);
        summaryByEmployee[emp] = summarizeAttendance(empRecords);
    }
    
    res.json(summaryByEmployee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/mark
router.post('/mark', async (req, res) => {
  const { employee_id, date, status, notes } = req.body;
  try {
    const { data, error } = await supabase
      .from('attendance')
      .upsert({ employee_id, date, status, notes, updated_at: new Date() }, { onConflict: 'employee_id,date' })
      .select();
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/bulk
router.post('/bulk', async (req, res) => {
  const { records } = req.body; // array of { employee_id, date, status }
  try {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'employee_id,date' })
      .select();
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
