const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const { calculatePayroll } = require('../services/payrollEngine');
const { summarizeAttendance } = require('../services/attendanceSummary');

// POST /api/payroll/calculate/:month/:year
router.post('/calculate/:month/:year', async (req, res) => {
  const { month, year } = req.params;
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  try {
    // 1. Fetch active employees
    const { data: employees, error: empErr } = await supabase.from('employees').select('*').eq('is_active', true);
    if (empErr) throw empErr;

    // 2. Fetch leave balances for the year
    const { data: leaveBalances, error: lbErr } = await supabase.from('leave_balances').select('*').eq('year', year);
    if (lbErr) throw lbErr;

    // 3. Fetch attendance
    const { data: attendance, error: attErr } = await supabase.from('attendance')
      .select('*').gte('date', startDate).lte('date', endDate);
    if (attErr) throw attErr;

    // 4. Fetch NSA logs
    const { data: nsaLogs, error: nsaErr } = await supabase.from('nsa_log')
      .select('*').eq('month', month).eq('year', year);
    if (nsaErr) throw nsaErr;

    // Calculate payroll for each employee
    const payrollRecords = [];
    for (const emp of employees) {
      const empAttendance = attendance.filter(a => a.employee_id === emp.id);
      const summary = summarizeAttendance(empAttendance);
      
      const empLeaveBalance = leaveBalances.find(lb => lb.employee_id === emp.id) || { al_balance: 0 };
      const empNsa = nsaLogs.filter(n => n.employee_id === emp.id).reduce((sum, n) => sum + Number(n.amount), 0);

      const calc = calculatePayroll(emp, summary, empLeaveBalance, empNsa);

      payrollRecords.push({
        employee_id: emp.id,
        month: parseInt(month),
        year: parseInt(year),
        base_salary: emp.base_salary,
        onsite_days: summary.onsite_days,
        wfh_days: summary.wfh_days,
        al_taken: summary.al_taken,
        hd_taken: summary.hd_taken,
        ph_days: summary.ph_days,
        comp_off_days: summary.comp_off_days,
        week_offs: summary.week_offs,
        sick_leave_days: summary.sick_leave_days,
        leave_balance_ytd: empLeaveBalance.al_balance,
        approved_leaves: calc.approved_leaves,
        lwp_days: calc.lwp_days,
        paid_days: calc.paid_days,
        working_days: summary.working_days,
        calculated_salary: calc.calculated_salary,
        nsa_amount: calc.nsa_amount,
        meal_allowance: calc.meal_allowance,
        net_pay: calc.net_pay,
        status: 'draft',
      });
    }

    // Upsert to payroll table
    const { data, error } = await supabase.from('payroll')
      .upsert(payrollRecords, { onConflict: 'employee_id,month,year' })
      .select();
      
    if (error) throw error;
    res.json({ message: 'Payroll calculated successfully', records: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payroll/summary/:month/:year
router.get('/summary/:month/:year', async (req, res) => {
    const { month, year } = req.params;
    try {
        const { data, error } = await supabase.from('payroll')
            .select(`
                *,
                employees (name, designation)
            `)
            .eq('month', month)
            .eq('year', year);
        
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/payroll/:id (Manual adjustment)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { arrears, bonus, advance_deduction, manual_adjustment } = req.body;
    
    try {
        // Fetch current to recalculate net pay
        const { data: current, error: fetchErr } = await supabase.from('payroll').select('*').eq('id', id).single();
        if (fetchErr) throw fetchErr;
        
        const netPay = Number(current.calculated_salary) + Number(current.nsa_amount) + Number(current.meal_allowance) 
            + Number(arrears || 0) + Number(bonus || 0) - Number(advance_deduction || 0) + Number(manual_adjustment || 0);

        const { data, error } = await supabase.from('payroll')
            .update({ arrears, bonus, advance_deduction, manual_adjustment, net_pay: Math.round(netPay * 100) / 100 })
            .eq('id', id)
            .select();
            
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/payroll/finalize/:month/:year
router.post('/finalize/:month/:year', async (req, res) => {
    const { month, year } = req.params;
    try {
        const { data, error } = await supabase.from('payroll')
            .update({ status: 'finalized', finalized_at: new Date() })
            .eq('month', month)
            .eq('year', year)
            .select();
            
        if (error) throw error;
        res.json({ message: 'Payroll finalized', records: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
