import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';

const Team = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('kpis'); // kpis, employees
  
  // KPI State
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '' });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Employee State
  const [employees, setEmployees] = useState([]);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ id: null, full_name: '', email: '', role: 'viewer', department: '', salary: '', password: '' });
  const [isSubmittingEmp, setIsSubmittingEmp] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch profiles
      const { data: profilesData, error: profilesErr } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
        
      if (profilesErr) throw profilesErr;

      // Fetch tasks
      const { data: tasksData, error: tasksErr } = await supabase
        .from('tasks')
        .select('*');
        
      if (tasksErr) throw tasksErr;
      
      const aggregatedMembers = (profilesData || []).map(profile => {
         const userTasks = (tasksData || []).filter(t => t.assigned_to === profile.id);
         const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
         const totalTasks = userTasks.length;
         return {
            id: profile.id,
            name: profile.full_name || profile.email,
            role: profile.role,
            department: profile.department || 'N/A',
            salary: profile.salary || 0,
            password: profile.password || '', // fetch password for display/editing
            primary_task: userTasks.length > 0 ? userTasks[0].title : 'Awaiting Assignment',
            kpiTarget: Math.max(totalTasks, 5),
            completed: completedTasks,
            status: completedTasks === totalTasks && totalTasks > 0 ? 'Excellent' : (totalTasks > 0 ? 'On Track' : 'Idle')
         };
      });

      setTeamMembers(aggregatedMembers);
      setEmployees(profilesData || []);
      setTasks(tasksData || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assigned_to) return;
    
    setIsSubmittingTask(true);
    try {
       // If the user is logged in via manual DB bypass, their ID won't exist in Supabase auth.users, 
       // which violates tasks_created_by_fkey. So we pass null for manual sessions.
       const isManualSession = !!localStorage.getItem('manual-session');
       const createdById = (user?.id?.startsWith('mock-') || isManualSession) ? null : (user?.id || null);
       
       const { error: insertErr } = await supabase.from('tasks').insert([{
          title: newTask.title,
          assigned_to: newTask.assigned_to,
          status: 'Pending',
          created_by: createdById
       }]);
       if (insertErr) throw insertErr;
       setIsTaskModalOpen(false);
       setNewTask({ title: '', assigned_to: '' });
       fetchData();
    } catch (err) {
       alert("Failed to assign task: " + err.message);
    } finally {
       setIsSubmittingTask(false);
    }
  };

  const handleAddOrUpdateEmployee = async (e) => {
    e.preventDefault();
    setIsSubmittingEmp(true);
    try {
       if (newEmp.id) {
          // Update existing
          const { error: updateErr } = await supabase.from('profiles').update({
             full_name: newEmp.full_name,
             role: role === 'super_admin' ? newEmp.role : undefined, // only super_admin can change roles
             department: newEmp.department,
             salary: parseFloat(newEmp.salary) || 0,
             password: newEmp.password // Update password manually
          }).eq('id', newEmp.id);
          
          if (updateErr) throw updateErr;
       } else {
          // Add new
          const mockId = crypto.randomUUID();
          const { error: insertErr } = await supabase.from('profiles').insert([{
             id: mockId,
             email: newEmp.email,
             full_name: newEmp.full_name,
             role: newEmp.role,
             department: newEmp.department,
             salary: parseFloat(newEmp.salary) || 0,
             password: newEmp.password // Save password manually
          }]);
          
          if (insertErr) {
             alert("Note: Due to Supabase Auth constraints, true user creation requires Admin API. Showing in UI only.");
          }
       }
       setIsEmpModalOpen(false);
       setNewEmp({ id: null, full_name: '', email: '', role: 'viewer', department: '', salary: '', password: '' });
       fetchData();
    } catch (err) {
       alert("Failed: " + err.message);
    } finally {
       setIsSubmittingEmp(false);
    }
  };

  const openEditEmployee = (emp) => {
     setNewEmp({
        id: emp.id,
        full_name: emp.full_name || '',
        email: emp.email || '',
        role: emp.role || 'viewer',
        department: emp.department || '',
        salary: emp.salary || '',
        password: emp.password || ''
     });
     setIsEmpModalOpen(true);
  };

  const handleDeleteEmployee = async (id) => {
     if (!window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;
     try {
        const { error: deleteErr } = await supabase.from('profiles').delete().eq('id', id);
        if (deleteErr) throw deleteErr;
        fetchData();
     } catch (err) {
        alert("Failed to delete employee: " + err.message);
     }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpiColumns = [
    { 
      header: 'Operator', 
      accessor: 'name', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs uppercase tracking-wider">
            {row.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{row.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{row.role}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Primary Active Task', 
      accessor: 'primary_task',
      render: (row) => <span className="text-sm font-medium text-slate-700 max-w-[200px] truncate block">{row.primary_task}</span>
    },
    { 
      header: 'Performance KPI', 
      accessor: 'completed',
      render: (row) => {
        const percent = (row.completed / row.kpiTarget) * 100;
        let color = 'bg-sky-500';
        if (percent < 50) color = 'bg-red-500';
        else if (percent > 90) color = 'bg-green-500';

        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${color}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <span className="text-xs font-space font-bold text-slate-700">{percent.toFixed(0)}%</span>
          </div>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let textCol = 'text-slate-600 bg-slate-100';
        if (row.status === 'Needs Attention' || row.status === 'Delayed') textCol = 'text-red-700 bg-red-50';
        if (row.status === 'Excellent') textCol = 'text-green-700 bg-green-50';
        return <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${textCol}`}>{row.status}</span>;
      }
    }
  ];

  const empColumns = [
    { header: 'Name', accessor: 'full_name', render: row => <span className="font-bold text-slate-800">{row.full_name || 'N/A'}</span> },
    { header: 'Email', accessor: 'email' },
    { header: 'Pass / Pin', accessor: 'password', render: row => <span className="font-mono text-slate-400 text-xs">{row.password || 'Not Set'}</span> },
    { header: 'Role', accessor: 'role', render: row => <span className="uppercase text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{row.role}</span> },
    { header: 'Department', accessor: 'department' },
    { header: 'Salary (INR)', accessor: 'salary', render: row => <span className="font-space font-bold text-slate-700">₹{(row.salary || 0).toLocaleString()}</span> },
    { header: 'Action', accessor: 'action', render: row => (
        <div className="flex gap-3">
           <button onClick={() => openEditEmployee(row)} className="text-sky-600 hover:text-sky-800 font-bold text-[10px] uppercase tracking-wider">Edit</button>
           <button onClick={() => handleDeleteEmployee(row.id)} className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase tracking-wider">Delete</button>
        </div>
    )}
  ];

  return (
    <>
      <section className="flex justify-between items-end mb-6 animate-fade-in relative z-10">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Team & Personnel</h2>
          <p className="text-slate-500 text-sm mt-1">Manage employees, track KPIs, and allocate resources.</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded p-1 w-fit animate-fade-in mb-6">
        <button onClick={() => setActiveTab('kpis')} className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all ${activeTab === 'kpis' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <span className="material-symbols-outlined text-sm">assignment_ind</span> Team KPIs
        </button>
        <button onClick={() => setActiveTab('employees')} className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all ${activeTab === 'employees' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <span className="material-symbols-outlined text-sm">badge</span> Employee Roster
        </button>
      </div>

      {error && (
         <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm flex items-center gap-2 shadow-sm">
           <span className="material-symbols-outlined text-red-500 text-sm">error</span>
           {error}
         </div>
      )}

      {/* KPI TAB */}
      {activeTab === 'kpis' && (
        <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Active Assignments</h4>
                <p className="text-xs text-slate-500">Live tracking of factory KPI completion.</p>
             </div>
             {(role === 'super_admin' || role === 'manager') && (
                <button onClick={() => setIsTaskModalOpen(true)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs shadow-md transition-all tracking-wider flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">assignment_add</span> ASSIGN TASK
                </button>
             )}
          </div>
          {loading ? (
             <div className="text-center p-10 text-slate-400">Loading...</div>
          ) : (
             <DataTable columns={kpiColumns} data={teamMembers} />
          )}
        </section>
      )}

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Personnel Roster</h4>
                <p className="text-xs text-slate-500">Manage employee details, roles, and compensation.</p>
             </div>
             {(role === 'super_admin' || role === 'manager') && (
                <button onClick={() => { setNewEmp({ id: null, full_name: '', email: '', role: 'viewer', department: '', salary: '', password: '' }); setIsEmpModalOpen(true); }} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-xs shadow-md transition-all tracking-wider flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">person_add</span> ADD EMPLOYEE
                </button>
             )}
          </div>
          {loading ? (
             <div className="text-center p-10 text-slate-400">Loading...</div>
          ) : (
             <DataTable columns={empColumns} data={employees} />
          )}
        </section>
      )}

      {/* TASK MODAL */}
      {isTaskModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Assign New Task</h3>
                  <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-700"><span className="material-symbols-outlined">close</span></button>
               </div>
               <form onSubmit={handleAssignTask} className="space-y-4">
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Task Description (Title)</label>
                     <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" placeholder="e.g. Verify LDPE Batch arrival" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Assign To Operator</label>
                     <select required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}>
                        <option value="" disabled>Select Operator...</option>
                        {teamMembers.map(m => (
                           <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                        ))}
                     </select>
                  </div>
                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 py-2 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded hover:bg-slate-50">Cancel</button>
                     <button type="submit" disabled={isSubmittingTask} className="flex-1 py-2 bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-sky-500 disabled:opacity-50">Assign Task</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* EMPLOYEE MODAL */}
      {isEmpModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">{newEmp.id ? 'Edit Employee' : 'Add Employee'}</h3>
                  <button onClick={() => setIsEmpModalOpen(false)} className="text-slate-400 hover:text-slate-700"><span className="material-symbols-outlined">close</span></button>
               </div>
               <form onSubmit={handleAddOrUpdateEmployee} className="space-y-4">
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Full Name</label>
                     <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" value={newEmp.full_name} onChange={e => setNewEmp({...newEmp, full_name: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Email</label>
                     <input type="email" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} disabled={!!newEmp.id} />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Login Password</label>
                     <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" placeholder="e.g. mysecure123" value={newEmp.password} onChange={e => setNewEmp({...newEmp, password: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Role</label>
                     <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} disabled={role !== 'super_admin'}>
                        <option value="qc">QC Officer</option>
                        <option value="manager">Manager</option>
                        <option value="director">Director</option>
                        <option value="accountant">Accountant</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="viewer">Viewer</option>
                     </select>
                     {role !== 'super_admin' && <p className="text-[9px] text-red-500 mt-1">Only Super Admins can change roles.</p>}
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Department</label>
                     <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Monthly Salary (INR)</label>
                     <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" value={newEmp.salary} onChange={e => setNewEmp({...newEmp, salary: e.target.value})} />
                  </div>
                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsEmpModalOpen(false)} className="flex-1 py-2 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded hover:bg-slate-50">Cancel</button>
                     <button type="submit" disabled={isSubmittingEmp} className="flex-1 py-2 bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-sky-500 disabled:opacity-50">Save Personnel</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </>
  );
};

export default Team;
