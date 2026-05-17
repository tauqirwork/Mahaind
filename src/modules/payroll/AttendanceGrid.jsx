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

const STATUS_OPTIONS = [
  { val: 'Onsite', label: 'P', full: 'Present (Onsite)' },
  { val: 'WFH', label: 'WFH', full: 'Work From Home' },
  { val: 'AL', label: 'AL', full: 'Annual Leave' },
  { val: 'HD', label: 'HD', full: 'Half Day' },
  { val: 'PH', label: 'PH', full: 'Public Holiday' },
  { val: 'Comp Off', label: 'CO', full: 'Compensatory Off' },
  { val: 'Week Off', label: 'WO', full: 'Week Off' },
  { val: 'Sick Leave', label: 'SL', full: 'Sick Leave' },
  { val: 'Absent', label: 'A', full: 'Absent' }
];

const AttendanceGrid = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch employees from profiles
      const { data: profilesData, error: profilesErr } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
        
      if (profilesErr) throw profilesErr;
      
      const empData = profilesData.map(p => ({
         id: p.id,
         name: p.full_name || p.email
      }));
      setEmployees(empData);

      // 2. Fetch attendance
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${daysInMonth}`;
      
      const { data: attData, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (attErr) throw attErr;
      
      setAttendance(attData || []);
      
      // 3. Calculate summary locally
      const newSummary = {};
      empData.forEach(emp => {
         const empAtt = (attData || []).filter(a => a.employee_id === emp.id);
         let working_days = 0;
         let total_leaves = 0;
         
         empAtt.forEach(a => {
            if (a.status === 'Onsite' || a.status === 'WFH') working_days += 1;
            else if (a.status === 'HD') {
               working_days += 0.5;
               total_leaves += 0.5;
            }
            else if (['AL', 'Sick Leave', 'Absent'].includes(a.status)) {
               total_leaves += 1;
            }
         });
         
         newSummary[emp.id] = { working_days, total_leaves };
      });
      setSummary(newSummary);

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const handleStatusChange = async (employeeId, day, newStatus) => {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Optimistic update
    const prevAtt = [...attendance];
    const existingIndex = attendance.findIndex(a => a.employee_id === employeeId && a.date === dateStr);
    
    let newAtt = [...attendance];
    if (existingIndex >= 0) {
      newAtt[existingIndex] = { ...newAtt[existingIndex], status: newStatus };
    } else {
      newAtt.push({ employee_id: employeeId, date: dateStr, status: newStatus });
    }
    setAttendance(newAtt);
    
    // Optimistically update summary
    const newSummary = {};
    employees.forEach(emp => {
        const empAtt = newAtt.filter(a => a.employee_id === emp.id);
        let working_days = 0;
        let total_leaves = 0;
        
        empAtt.forEach(a => {
        if (a.status === 'Onsite' || a.status === 'WFH') working_days += 1;
        else if (a.status === 'HD') {
            working_days += 0.5;
            total_leaves += 0.5;
        }
        else if (['AL', 'Sick Leave', 'Absent'].includes(a.status)) {
            total_leaves += 1;
        }
        });
        
        newSummary[emp.id] = { working_days, total_leaves };
    });
    setSummary(newSummary);

    try {
      if (existingIndex >= 0) {
          const recordId = prevAtt[existingIndex].id;
          if (recordId) {
             const { error } = await supabase.from('attendance').update({ status: newStatus }).eq('id', recordId);
             if (error) throw error;
          } else {
             // Fallback if ID is missing
             const { error } = await supabase.from('attendance').update({ status: newStatus }).match({ employee_id: employeeId, date: dateStr });
             if (error) throw error;
          }
      } else {
          const { error } = await supabase.from('attendance').insert([{ employee_id: employeeId, date: dateStr, status: newStatus }]);
          if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save attendance: ' + err.message);
      setAttendance(prevAtt); // revert
      fetchData(); // Hard refresh to ensure summary is correct
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Onsite': return 'bg-emerald-500 text-white';
      case 'WFH': return 'bg-orange-400 text-white';
      case 'AL': return 'bg-rose-500 text-white';
      case 'HD': return 'bg-rose-300 text-white';
      case 'PH': return 'bg-purple-500 text-white';
      case 'Comp Off': return 'bg-sky-400 text-white';
      case 'Sick Leave': return 'bg-pink-500 text-white';
      case 'Absent': return 'bg-red-600 text-white';
      case 'Week Off': return 'bg-slate-300 text-slate-700';
      default: return 'bg-slate-100 hover:bg-slate-200 text-transparent';
    }
  };

  return (
    <div className="bg-white rounded shadow border border-slate-200 relative pb-16">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-700">Monthly Attendance</h2>
        <div className="flex gap-2">
            <select className="border rounded p-1 text-sm bg-white" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>)}
            </select>
            <input type="number" className="border rounded p-1 text-sm w-20 bg-white" value={year} onChange={e => setYear(parseInt(e.target.value))} />
            <button onClick={fetchData} className="px-3 py-1 bg-sky-100 text-sky-700 rounded text-sm hover:bg-sky-200">Refresh</button>
            <button onClick={() => window.print()} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 ml-4 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span> Export Attendance
            </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
            <tr>
              <th className="px-4 py-2 border-r sticky left-0 bg-slate-100 z-10 shadow-sm">Employee</th>
              {daysArray.map(day => (
                <th key={day} className="px-1 py-2 border-r text-center w-8 text-xs">
                  {day}
                </th>
              ))}
              <th className="px-4 py-2 text-center sticky right-0 bg-slate-100 shadow-sm border-l">Summary</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const empSummary = summary[emp.id] || { working_days: 0, total_leaves: 0, wfh_days: 0 };
              
              return (
                <tr key={emp.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 border-r sticky left-0 bg-white font-medium z-10 shadow-sm">{emp.name}</td>
                  
                  {daysArray.map(day => {
                    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const record = attendance.find(a => a.employee_id === emp.id && a.date === dateStr);
                    const status = record?.status || '';
                    const matchedOption = STATUS_OPTIONS.find(opt => opt.val === status);
                    
                    return (
                      <td key={day} className="px-1 py-1 border-r text-center relative group">
                        <select 
                          className={`appearance-none w-8 h-8 rounded text-center text-xs font-bold cursor-pointer transition-colors focus:ring-2 ring-sky-400 outline-none ${getStatusColor(status)}`}
                          value={status}
                          onChange={(e) => handleStatusChange(emp.id, day, e.target.value)}
                        >
                          <option value="" className="bg-white text-slate-900"></option>
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.val} value={opt.val} className="bg-white text-slate-900">{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                  
                  <td className="px-4 py-2 text-center text-xs font-bold text-slate-600 sticky right-0 bg-white border-l shadow-sm">
                    P: {empSummary.working_days || 0} | L: {empSummary.total_leaves || 0}
                  </td>
                </tr>
              );
            })}
            
            {employees.length === 0 && !loading && (
              <tr>
                <td colSpan={daysInMonth + 2} className="text-center py-8 text-slate-500">No employees found. Please add employees first.</td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={daysInMonth + 2} className="text-center py-8 text-sky-600">Loading...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend Widget */}
      <div className="fixed bottom-6 right-6 bg-white border border-slate-200 shadow-xl rounded-lg p-4 z-50 w-max">
        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b pb-1 mb-2">Acronym Legend</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {STATUS_OPTIONS.map(opt => (
            <div key={opt.val} className="flex items-center gap-2">
               <span className="font-bold text-slate-700 w-8 text-right">{opt.label}</span>
               <span className="text-slate-500 whitespace-nowrap">= {opt.full}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceGrid;
