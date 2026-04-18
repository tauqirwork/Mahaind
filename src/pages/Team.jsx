import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';

const Team = () => {
  const { user } = useAuth(); // Need to capture the current admin allocating the task
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '' });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      // Fetch user profiles
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
      
      // Compute aggregated team stats
      const aggregatedMembers = (profilesData || []).map(profile => {
         const userTasks = (tasksData || []).filter(t => t.assigned_to === profile.id);
         const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
         const totalTasks = userTasks.length;
         
         return {
            id: profile.id,
            name: profile.full_name || profile.email,
            role: profile.role === 'super_admin' ? 'Super Admin' : 'Operator',
            primary_task: userTasks.length > 0 ? userTasks[0].title : 'Awaiting Assignment',
            kpiTarget: Math.max(totalTasks, 5), // Base target of 5 if they have few tasks
            completed: completedTasks,
            status: completedTasks === totalTasks && totalTasks > 0 ? 'Excellent' : (totalTasks > 0 ? 'On Track' : 'Idle')
         };
      });

      setTeamMembers(aggregatedMembers);
      setTasks(tasksData || []);
      setError(null);
    } catch (err) {
      if (err.code === '42P01') {
         setError("Supabase Tables Missing! Please execute the Phase IV schema block in your SQL Editor.");
      } else {
         setError(err.message);
      }
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assigned_to) return;
    
    setIsSubmittingTask(true);
    try {
       const { error: insertErr } = await supabase.from('tasks').insert([{
          title: newTask.title,
          assigned_to: newTask.assigned_to,
          status: 'Pending',
          created_by: user?.id || null
       }]);
       
       if (insertErr) throw insertErr;
       
       setIsTaskModalOpen(false);
       setNewTask({ title: '', assigned_to: '' });
       fetchTeamData(); // Refresh the grid to show new KPI metrics
    } catch (err) {
       alert("Failed to assign task: " + err.message);
    } finally {
       setIsSubmittingTask(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const columns = [
    { 
      header: 'Operator', 
      accessor: 'name', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs uppercase tracking-wider">
            {row.name.charAt(0)}
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

        return (
          <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${textCol}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  return (
    <>
      <section className="flex justify-between items-end mb-8 animate-fade-in relative z-10">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Team Operations Engine</h2>
          <p className="text-slate-500 text-sm mt-1">Live tracking of active staff assignments and factory KPI completion.</p>
        </div>
        <button 
           onClick={() => setIsTaskModalOpen(true)}
           className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs shadow-md transition-all tracking-wider flex items-center gap-2"
        >
            <span className="material-symbols-outlined text-sm">assignment_add</span> ASSIGN NEW TASK
        </button>
      </section>

      {/* NEW TASK MODAL */}
      {isTaskModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Assign New Task</h3>
                  <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                     <span className="material-symbols-outlined">close</span>
                  </button>
               </div>
               
               <form onSubmit={handleAssignTask} className="space-y-4">
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Task Description (Title)</label>
                     <input 
                        type="text" required
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                        placeholder="e.g. Verify LDPE Batch arrival"
                        value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Assign To Operator</label>
                     <select 
                        required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                        value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
                     >
                        <option value="" disabled>Select Operator...</option>
                        {teamMembers.map(m => (
                           <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                        ))}
                     </select>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 py-2 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded hover:bg-slate-50">Cancel</button>
                     <button type="submit" disabled={isSubmittingTask} className="flex-1 py-2 bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-sky-500 disabled:opacity-50">
                        {isSubmittingTask ? 'Assigning...' : 'Assign Task'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {error && (
         <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm flex items-center gap-2 shadow-sm">
           <span className="material-symbols-outlined text-red-500 text-sm">error</span>
           {error}
         </div>
      )}

      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
        {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 h-[200px]">
               <span className="material-symbols-outlined text-4xl mb-2 animate-spin slow">sync</span>
               <p className="text-xs font-bold uppercase tracking-widest">Querying Operational Database</p>
            </div>
        ) : teamMembers.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center text-slate-400 h-[200px] border-2 border-dashed border-slate-200 rounded bg-slate-50">
               <span className="material-symbols-outlined text-5xl mb-4 text-slate-300">group_off</span>
               <h4 className="text-slate-700 font-space font-bold mb-1">No Active Operators Found</h4>
               <p className="text-sm text-center max-w-sm">Operators must be provisioned in the application Database to track task KPIs.</p>
            </div>
        ) : (
            <DataTable columns={columns} data={teamMembers} />
        )}
      </section>
      
      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: '100ms'}}>
         <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10">
               <span className="material-symbols-outlined select-none" style={{fontSize: '150px'}}>trending_up</span>
            </div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Plant Efficiency Score</h4>
            <div className="flex items-end gap-3 relative z-10">
              <span className="text-4xl font-space font-bold text-green-400">92.4%</span>
              <span className="text-green-500 text-sm font-bold flex items-center mb-1"><span className="material-symbols-outlined text-sm">arrow_upward</span> 4.1%</span>
            </div>
            <p className="text-xs text-slate-500 mt-4 max-w-[80%] relative z-10">Aggregated from production output speed versus raw material cost metrics mapped this month.</p>
         </div>

         <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Upcoming Staff Interventions</h4>
            <ul className="space-y-4">
               <li className="flex gap-3">
                  <div className="w-8 flex-shrink-0 flex justify-center text-orange-500 mt-1">
                     <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Inventory Sync Delay</p>
                    <p className="text-xs text-slate-500">Priya Mehta requires manual verification of the LDPE batch arrival.</p>
                  </div>
               </li>
               <li className="flex gap-3">
                  <div className="w-8 flex-shrink-0 flex justify-center text-sky-500 mt-1">
                     <span className="material-symbols-outlined">info</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Sales Review</p>
                    <p className="text-xs text-slate-500">Rohit Verma has requested an expansion on targeting agricultural suppliers.</p>
                  </div>
               </li>
            </ul>
         </div>
      </section>
    </>
  );
};

export default Team;
