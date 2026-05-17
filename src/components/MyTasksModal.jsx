import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const MyTasksModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Wait, we mapped email to id manually in local mock or they have a true auth.users id.
      // If the user's mock id isn't in profiles matching their auth.users id, they might not see tasks.
      // Let's get their profile ID by email to be safe, since auth.users might have a different ID if using mock login.
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single();
        
      const profileId = profileData ? profileData.id : user.id;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyTasks();
    }
  }, [isOpen, user]);

  const markCompleted = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'Completed' })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));
    } catch (err) {
      alert("Failed to update task: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div>
             <h3 className="text-xl font-bold font-space text-slate-900 uppercase tracking-tight">My Assigments & KPIs</h3>
             <p className="text-xs text-slate-500 mt-1">Track and complete your operational targets.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center">
             <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading your tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
               <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">task</span>
               <p className="text-sm font-bold">No Assigned Tasks</p>
               <p className="text-xs mt-1">You currently have no active KPIs or assignments.</p>
            </div>
          ) : (
            <div className="space-y-4">
               {tasks.map(task => (
                 <div key={task.id} className={`p-4 border rounded-lg flex items-center justify-between gap-4 transition-all ${task.status === 'Completed' ? 'bg-green-50/50 border-green-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex-1">
                       <h4 className={`text-sm font-bold ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                          {task.title}
                       </h4>
                       <p className="text-xs text-slate-400 mt-1">
                          Status: <span className={`font-bold ${task.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>{task.status}</span>
                       </p>
                    </div>
                    {task.status !== 'Completed' && (
                       <button 
                          onClick={() => markCompleted(task.id)}
                          className="px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-200 hover:border-sky-600 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                       >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span> Mark Done
                       </button>
                    )}
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasksModal;
