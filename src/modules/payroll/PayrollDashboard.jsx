import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function getToken() {
  const manualSession = localStorage.getItem('manual-session');
  if (manualSession) return 'mock-admin-token';
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) return data.session.access_token;
  } catch (e) {}
  const mockToken = localStorage.getItem('mock-auth-token');
  if (mockToken && mockToken !== 'null') return mockToken;
  return 'mock-admin-token';
}

const PayrollDashboard = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      // 1. Fetch saved payroll for this month
      const { data: savedPayroll, error: prErr } = await supabase
         .from('payroll')
         .select('*, profiles(full_name, email)')
         .eq('month', month)
         .eq('year', year);
         
      if (prErr && prErr.code !== '42P01') throw prErr; // Ignore "relation does not exist" if table is missing initially
      
      if (savedPayroll && savedPayroll.length > 0) {
         setPayrollData(savedPayroll.map(p => ({
            id: p.id,
            employee_id: p.employee_id,
            employees: { name: p.profiles?.full_name || p.profiles?.email },
            base_salary: p.base_salary,
            lwp_days: p.lwp_days,
            nsa_amount: p.nsa_amount,
            meal_allowance: p.meal_allowance,
            arrears: p.arrears,
            net_pay: p.net_pay,
            status: p.status
         })));
      } else {
         setPayrollData([]);
      }
    } catch (err) {
      console.error("Payroll fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const handleCalculate = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all employees
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
      if (pErr) throw pErr;
      
      // 2. Fetch all attendance for the month
      const daysInMonth = new Date(year, month, 0).getDate();
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${daysInMonth}`;
      
      const { data: attendance, error: aErr } = await supabase
         .from('attendance')
         .select('*')
         .gte('date', startDate)
         .lte('date', endDate);
      if (aErr) throw aErr;
      
      const calculatedData = profiles.map(emp => {
         const empAtt = attendance.filter(a => a.employee_id === emp.id);
         let total_leaves = 0;
         
         empAtt.forEach(a => {
            if (a.status === 'HD') total_leaves += 0.5;
            else if (['AL', 'Sick Leave', 'Absent'].includes(a.status)) total_leaves += 1;
         });
         
         const base = Number(emp.salary) || 0;
         const dailyRate = base / 30; // Standard 30 days calculation
         const lwp_deduction = total_leaves * dailyRate;
         
         // Mock allowances/arrears for now (in real app, fetch from a separate table)
         const meal_allowance = 0; 
         const arrears = 0;
         const nsa_amount = 0;
         
         const net_pay = Math.max(0, base - lwp_deduction + meal_allowance + arrears + nsa_amount);
         
         return {
            employee_id: emp.id,
            month,
            year,
            base_salary: base,
            lwp_days: total_leaves,
            nsa_amount,
            meal_allowance,
            arrears,
            net_pay: Math.round(net_pay),
            status: 'draft'
         };
      });
      
      // Delete existing drafts
      await supabase.from('payroll').delete().eq('month', month).eq('year', year).eq('status', 'draft');
      
      // Insert new calculation
      const { error: insErr } = await supabase.from('payroll').insert(calculatedData);
      if (insErr) {
         if (insErr.code === '42P01') {
             throw new Error("The 'payroll' table does not exist in Supabase yet. Please run the setup SQL.");
         }
         throw insErr;
      }
      
      alert('Payroll calculated successfully!');
      await fetchPayroll();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm(`Are you sure you want to finalize payroll for ${month}/${year}?`)) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('payroll').update({ status: 'finalized' }).eq('month', month).eq('year', year);
      if (error) throw error;
      
      alert('Payroll Finalized!');
      await fetchPayroll();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow border border-slate-200 relative pb-16">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-700">Payroll Calculation</h2>
        <div className="flex gap-4 items-center">
            <div className="flex gap-2">
                <select className="border rounded p-1 text-sm bg-white" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                    {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>)}
                </select>
                <input type="number" className="border rounded p-1 text-sm w-20 bg-white" value={year} onChange={e => setYear(parseInt(e.target.value))} />
            </div>
            <div className="h-6 w-px bg-slate-300"></div>
            <div className="flex gap-2">
                <button onClick={handleCalculate} disabled={loading} className="px-3 py-1 bg-sky-600 text-white rounded text-sm font-semibold hover:bg-sky-700 disabled:opacity-50">Calculate All</button>
                <button onClick={handleFinalize} disabled={loading} className="px-3 py-1 bg-slate-700 text-white rounded text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">Finalize</button>
                <button onClick={() => window.print()} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 ml-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">download</span> Export Salary Slips
                </button>
            </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 text-right">Base Sal.</th>
              <th className="px-4 py-3 text-center">LWP</th>
              <th className="px-4 py-3 text-right">NSA</th>
              <th className="px-4 py-3 text-right">Meal All.</th>
              <th className="px-4 py-3 text-right">Arrears</th>
              <th className="px-4 py-3 text-right font-bold">Net Pay</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payrollData.length === 0 && !loading && (
                <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">No payroll data calculated for this month yet. Click "Calculate All".</td>
                </tr>
            )}
            {loading && (
                <tr>
                    <td colSpan={9} className="text-center py-8 text-sky-600">Loading...</td>
                </tr>
            )}
            {payrollData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-500 font-mono">{row.employee_id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{row.employees?.name}</td>
                <td className="px-4 py-3 text-right text-slate-600">₹{Number(row.base_salary).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.lwp_days > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {row.lwp_days}
                    </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-600">₹{Number(row.nsa_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-600">₹{Number(row.meal_allowance).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-600">₹{Number(row.arrears).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">₹{Number(row.net_pay).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.status === 'finalized' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {row.status}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
          {payrollData.length > 0 && (
            <tfoot className="bg-slate-50 border-t font-bold text-slate-700">
                <tr>
                    <td colSpan="7" className="px-4 py-3 text-right">Total Net Pay:</td>
                    <td className="px-4 py-3 text-right text-emerald-700 text-base">
                        ₹{payrollData.reduce((sum, r) => sum + Number(r.net_pay), 0).toLocaleString()}
                    </td>
                    <td></td>
                </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Legend Widget */}
      <div className="fixed bottom-6 right-6 bg-white border border-slate-200 shadow-xl rounded-lg p-4 z-50 w-max">
        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b pb-1 mb-2">Acronym Legend</h4>
        <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex gap-2"><span className="font-bold text-slate-700 w-12 text-right">LWP</span><span className="text-slate-500 whitespace-nowrap">= Leave Without Pay</span></div>
            <div className="flex gap-2"><span className="font-bold text-slate-700 w-12 text-right">NSA</span><span className="text-slate-500 whitespace-nowrap">= Night Shift Allowance</span></div>
            <div className="flex gap-2"><span className="font-bold text-slate-700 w-12 text-right">Meal All.</span><span className="text-slate-500 whitespace-nowrap">= Meal Allowance</span></div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
