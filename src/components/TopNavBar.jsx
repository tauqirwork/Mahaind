import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';
import MyTasksModal from './MyTasksModal';
import { fetchInventoryData } from '../services/inventoryService';

const TopNavBar = () => {
  const { filters, updateFilter } = useDashboardData();
  const { user, role, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const result = await fetchInventoryData();
        if (result?.alerts) {
          setAlerts(result.alerts);
        }
      } catch (e) {
        console.error("Failed to load alerts for notifications", e);
      }
    };
    loadAlerts();
    const intervalId = setInterval(loadAlerts, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const getRoleDisplay = () => {
     switch(role) {
        case 'super_admin': return 'Super Admin';
        case 'manager': return 'Manager';
        case 'director': return 'Director';
        case 'qc': return 'QC Officer';
        case 'accountant': return 'Accountant';
        default: return role || 'User';
     }
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  return (
    <>
    <header className="fixed top-0 right-0 left-64 h-16 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/15 shadow-sm flex justify-between items-center px-8">
      <div className="flex items-center gap-8">
        <div className="flex items-center bg-slate-100 rounded px-4 py-1.5 w-80">
          <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 focus:outline-none ml-2" 
            placeholder="Search active view..." 
            type="text"
            value={filters.searchQuery || ''}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
          />
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-orange-600 font-bold border-b-2 border-orange-600 px-1 py-5 transition-all" : "text-slate-600 hover:text-sky-700 font-medium px-1 py-5 border-b-2 border-transparent transition-all"}>Live Feed</NavLink>
          <NavLink to="/inventory" className={({ isActive }) => isActive ? "text-orange-600 font-bold border-b-2 border-orange-600 px-1 py-5 transition-all" : "text-slate-600 hover:text-sky-700 font-medium px-1 py-5 border-b-2 border-transparent transition-all"}>Inventory</NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowTasksModal(true)}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-all"
            title="My KPIs & Tasks"
          >
            <span className="material-symbols-outlined">assignment</span>
          </button>
          <div className="relative">
            <button 
               onClick={() => setShowNotifications(!showNotifications)}
               className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-all relative"
               title="Notifications & Alerts"
            >
               <span className="material-symbols-outlined">notifications</span>
               {alerts.length > 0 && (
                 <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
               )}
            </button>
            {showNotifications && (
               <div className="absolute top-11 right-0 w-80 bg-white border border-slate-200 rounded shadow-xl z-50 overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
                 <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-800">Alerts & Notifications</h4>
                    {alerts.length > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{alerts.length} New</span>}
                 </div>
                 <div className="max-h-80 overflow-y-auto">
                    {alerts.length === 0 ? (
                       <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                    ) : (
                       alerts.map((alert, i) => (
                          <div key={i} className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 flex gap-3 transition-colors">
                             <div className="mt-0.5 shrink-0">
                                <span className="material-symbols-outlined text-orange-500 text-[18px]">warning</span>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-800 leading-tight">{alert.material}</p>
                                <p className="text-[11px] text-slate-600 mt-1 leading-snug">{alert.message}</p>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
               </div>
            )}
          </div>
          {role === 'super_admin' && (
            <NavLink to="/settings" className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-all" title="Manage Conversion Sheets">
              <span className="material-symbols-outlined text-[20px]">settings_suggest</span>
            </NavLink>
          )}
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center gap-3 relative">
          <div className="text-right">
            <p className="text-xs font-bold font-space text-slate-900">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">{getRoleDisplay()}</p>
          </div>
          <button 
            className="w-9 h-9 rounded bg-sky-100 text-sky-700 font-bold flex items-center justify-center overflow-hidden border border-sky-300 hover:bg-sky-200 transition-colors focus:outline-none"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {getInitials()}
          </button>
          
          {showDropdown && (
            <div className="absolute top-12 right-0 w-48 bg-white border border-slate-200 rounded shadow-lg py-2 z-50">
               <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-800">{user?.user_metadata?.full_name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
               </div>
               <button 
                 onClick={() => { setShowDropdown(false); setShowTasksModal(true); }}
                 className="w-full text-left px-4 py-2 text-sm text-sky-700 hover:bg-sky-50 font-bold flex items-center gap-2"
               >
                 <span className="material-symbols-outlined text-[16px]">assignment</span> My Tasks
               </button>
               <button 
                 onClick={() => { setShowDropdown(false); logout(); }}
                 className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"
               >
                 <span className="material-symbols-outlined text-[16px]">logout</span> Sign Out
               </button>
            </div>
          )}
        </div>
      </div>
    </header>
    
    <MyTasksModal isOpen={showTasksModal} onClose={() => setShowTasksModal(false)} />
    </>
  );
};

export default TopNavBar;

