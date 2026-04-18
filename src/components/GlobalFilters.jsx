import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';

const GlobalFilters = () => {
  const { filters, updateFilter, clearFilters, data } = useDashboardData();

  const uniqueClients = [...new Set([
    ...data.dispatch.map(d => d.client_name),
    ...data.receivables.map(d => d.client_name)
  ])].filter(Boolean);

  const uniqueVendors = [...new Set(data.payables.map(d => d.vendor_name))].filter(Boolean);

  const hasFilters = filters.client || filters.vendor || filters.dateRange.start || filters.dateRange.end;

  const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors";

  return (
    <div className="bg-white border border-slate-200 rounded p-6 shadow-sm mb-8 animate-fade-in flex flex-wrap items-end gap-6">
      
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold font-space text-slate-500 uppercase tracking-widest mb-2">Client</label>
        <select 
          className={inputClasses}
          value={filters.client}
          onChange={(e) => updateFilter('client', e.target.value)}
        >
          <option value="">All Clients</option>
          {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold font-space text-slate-500 uppercase tracking-widest mb-2">Vendor</label>
        <select 
          className={inputClasses}
          value={filters.vendor}
          onChange={(e) => updateFilter('vendor', e.target.value)}
        >
          <option value="">All Vendors</option>
          {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold font-space text-slate-500 uppercase tracking-widest mb-2">Start Date</label>
        <input 
          type="date"
          className={inputClasses}
          value={filters.dateRange.start}
          onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
        />
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold font-space text-slate-500 uppercase tracking-widest mb-2">End Date</label>
        <input 
          type="date"
          className={inputClasses}
          value={filters.dateRange.end}
          onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
        />
      </div>

      {hasFilters && (
        <div>
          <button 
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded text-sm font-bold transition-colors h-[38px]"
            onClick={clearFilters}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Clear
          </button>
        </div>
      )}

    </div>
  );
};

export default GlobalFilters;
