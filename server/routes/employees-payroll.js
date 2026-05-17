const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('employees').select('*').order('id');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees
router.post('/', async (req, res) => {
  const employee = req.body;
  try {
    const { data, error } = await supabase.from('employees').insert(employee).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body, updated_at: new Date() };
  try {
    const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id/leave-balance
router.get('/:id/leave-balance/:year', async (req, res) => {
  const { id, year } = req.params;
  try {
    const { data, error } = await supabase.from('leave_balances')
        .select('*')
        .eq('employee_id', id)
        .eq('year', year)
        .single();
    if (error && error.code !== 'PGRST116') throw error; // ignore no rows
    res.json(data || { employee_id: id, year, al_balance: 0, sl_balance: 0, comp_off_bal: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id/leave-balance
router.put('/:id/leave-balance/:year', async (req, res) => {
  const { id, year } = req.params;
  const balances = req.body;
  try {
    const { data, error } = await supabase.from('leave_balances')
        .upsert({ employee_id: id, year, ...balances, updated_at: new Date() }, { onConflict: 'employee_id,year' })
        .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/nsa-log
router.post('/nsa-log', async (req, res) => {
    try {
        const { data, error } = await supabase.from('nsa_log').insert(req.body).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/nsa-log/:month/:year
router.get('/nsa-log/:month/:year', async (req, res) => {
    const { month, year } = req.params;
    try {
        const { data, error } = await supabase.from('nsa_log')
            .select(`*, employees (name)`)
            .eq('month', month)
            .eq('year', year);
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
