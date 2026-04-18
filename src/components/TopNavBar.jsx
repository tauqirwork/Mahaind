import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';

const TopNavBar = () => {
  const { filters, updateFilter } = useDashboardData();
  
  return (
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
          <NavLink to="/dashboard" className="text-orange-600 font-bold border-b-2 border-orange-600 px-1 py-5">Live Feed</NavLink>
          <NavLink to="/reports" className="text-slate-600 hover:text-sky-700 transition-all font-medium">Reports</NavLink>
          <NavLink to="/inventory" className="text-slate-600 hover:text-sky-700 transition-all font-medium">Inventory</NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <NavLink to="/settings" className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-all" title="Manage Conversion Sheets">
            <span className="material-symbols-outlined text-[20px]">settings_suggest</span>
          </NavLink>
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold font-space text-slate-900">Shaikh Tauqir</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Dev.Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded bg-slate-200 overflow-hidden border border-slate-300">
            <img alt="User Profile Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfRX6lT_iY87GbkR346tgMFnmDy3RlekeHQ8kBdWQau6RvhYQJT7QDmr-YCaNlk7VHjmzjSKmUlhbwGDQgwaiXYcflbkj2MAwCIXIhIomxmi4qVAw-n0-4QmaQ5x-79Lno08O_JTsqx1r3QalZoATfiTDbw2sCspeIfWiLAZF5TifyH3zI7ZtFE8mXUVi8E6UaPqQuDWJLeWrvg58zzVDLBQuFmNAPedG69UQlLHSuQOxcW0rN04xhkvVpCy5Qa4P36dyzqjYZFA4" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
