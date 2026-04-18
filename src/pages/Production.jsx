import React, { useState, useEffect, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import { fetchProductionData } from '../services/productionService';
import { supabase } from '../utils/supabaseClient';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Production = () => {
  const [data, setData] = useState(null);
  const [twinData, setTwinData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Machine Modal State
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [newMachine, setNewMachine] = useState({ name: '', type: 'Loom' });
  const [isSubmittingMachine, setIsSubmittingMachine] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        // Load legacy sheet data
        const result = await fetchProductionData();
        setData(result);
        
        // Load Phase IV Machine Status (Twin)
        const { data: dbTwin, error: twinErr } = await supabase.from('machines').select('*').order('name');
        if (!twinErr) {
           setTwinData(dbTwin || []);
        }

      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleRegisterMachine = async (e) => {
    e.preventDefault();
    if (!newMachine.name) return;
    setIsSubmittingMachine(true);
    try {
       const { error: insertErr } = await supabase.from('machines').insert([{
          name: newMachine.name,
          type: newMachine.type,
          status: 'Idle',
          uptime_percentage: 100.00
       }]);
       if (insertErr) throw insertErr;
       
       setIsMachineModalOpen(false);
       setNewMachine({ name: '', type: 'Loom' });
       
       // Refresh twin data
       const { data: dbTwin } = await supabase.from('machines').select('*').order('name');
       if (dbTwin) setTwinData(dbTwin);
    } catch (err) {
       alert("Failed to register machine: " + err.message);
    } finally {
       setIsSubmittingMachine(false);
    }
  };

  const rmBreakdown = useMemo(() => {
    if (!data?.tapelineRM?.rmTotals) return [];
    const t = data.tapelineRM.rmTotals;
    return [
      { name: 'PP', value: Math.round(t.pp) },
      { name: 'Filler', value: Math.round(t.filler) },
      { name: 'Masterbatch', value: Math.round(t.mb) },
      { name: 'Modifier', value: Math.round(t.modifier) },
      { name: 'LDPE', value: Math.round(t.ldpe) },
      { name: 'UV', value: Math.round(t.uv) },
      { name: 'RP', value: Math.round(t.rp) },
    ].filter(r => r.value > 0);
  }, [data]);

  const dailyTrend = useMemo(() => {
    if (!data?.datewise?.dailyLog) return [];
    return data.datewise.dailyLog.map((d, i) => ({
      day: `Day ${i + 1}`,
      tapeline: d.tapelineRM,
      baling: d.balingNOS,
      dispatch: d.dispatchNOS,
    }));
  }, [data]);

  if (error) return <div className="text-red-500 font-bold p-8">Failed to load production data: {error.message}</div>;

  const machineColumns = [
    { header: 'Machine', accessor: 'machine' },
    { header: 'Actual Output', accessor: 'actual', render: (row) => <span className="font-space font-bold">{row.actual.toLocaleString()}</span> },
    { header: 'Capacity (24h)', accessor: 'capacity', render: (row) => row.capacity.toLocaleString() },
    { header: 'Gap', accessor: 'difference', render: (row) => <span className="text-red-500 font-bold">{row.difference.toLocaleString()}</span> },
    {
      header: 'Utilization',
      accessor: 'utilization',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
            <div
              className={`h-full rounded-full ${row.utilization > 70 ? 'bg-green-500' : row.utilization > 40 ? 'bg-orange-400' : 'bg-red-500'}`}
              style={{ width: `${Math.min(row.utilization, 100)}%` }}
            />
          </div>
          <span className="text-xs font-space font-bold text-slate-700">{row.utilization.toFixed(1)}%</span>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'daily', label: 'Daily Log', icon: 'calendar_month' },
    { id: 'rm', label: 'RM Consumption', icon: 'science' },
  ];

  return (
    <>
      {/* Header */}
      <section className="flex justify-between items-end animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Production & Conversion</h2>
          <p className="text-slate-500 text-sm mt-1">
            {data?.month ? `Active month: ${data.month}` : 'Monthly conversion tracking and efficiency metrics.'}
          </p>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-12 gap-6 animate-fade-in">
        <KpiCard
          title="Total RM Input"
          value={isLoading ? '—' : `${Math.round(data?.efficiency?.totalRMInput || 0).toLocaleString()} kg`}
          icon="science"
          theme="sky"
        />
        <KpiCard
          title="Yield"
          value={isLoading ? '—' : `${(data?.efficiency?.yieldPercent || 0).toFixed(1)}%`}
          icon="speed"
          theme="green"
        />
        <KpiCard
          title="Wastage"
          value={isLoading ? '—' : `${(data?.efficiency?.wastagePercent || 0).toFixed(1)}%`}
          icon="delete"
          theme="orange"
        />
        <KpiCard
          title="Machines Tracked"
          value={isLoading ? '—' : data?.machines?.length || 0}
          icon="precision_manufacturing"
          theme="solidPrimary"
          isSolid={true}
          subtitle="Real-time monitoring"
        />
      </section>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded p-1 w-fit animate-fade-in">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Phase IV: Factory Digital Twin */}
          <section className="bg-slate-900 border border-slate-800 rounded p-8 shadow-sm animate-fade-in mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none">
               <span className="material-symbols-outlined select-none" style={{fontSize: '300px', transform: 'translate(10%, -20%)'}}>precision_manufacturing</span>
            </div>
            <div className="relative z-10 flex justify-between items-center mb-6">
              <div>
                <h4 className="text-lg font-bold font-space text-white uppercase tracking-tight mb-1">Factory Digital Twin</h4>
                <p className="text-xs text-slate-400">Real-time status monitoring driven by PostgREST.</p>
              </div>
              <button 
                onClick={() => setIsMachineModalOpen(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded text-[10px] font-bold tracking-wider transition-colors flex items-center gap-2"
              >
                  <span className="material-symbols-outlined text-[14px]">add</span> REGISTER MACHINE
              </button>
            </div>
            
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
               {twinData.length === 0 ? (
                  <div className="col-span-full border border-slate-700 border-dashed rounded p-4 text-center">
                     <p className="text-slate-500 text-xs">No machines registered in the Supabase Twin Database.</p>
                  </div>
               ) : twinData.map(m => (
                  <div key={m.id} className="bg-slate-800 border border-slate-700 hover:border-slate-600 p-4 rounded text-center transition-colors">
                     <span className={`material-symbols-outlined text-3xl mb-2 ${m.status === 'Running' ? 'text-green-500' : m.status === 'Idle' ? 'text-orange-500' : 'text-red-500'}`}>
                        {m.type === 'Loom' ? 'memory' : m.type === 'Extruder' ? 'heat_pump' : 'print'}
                     </span>
                     <p className="text-white font-bold text-sm truncate">{m.name}</p>
                     <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">{m.type}</p>
                     <div className={`mt-3 mx-auto px-2 py-0.5 rounded text-[10px] inline-block font-bold tracking-wider ${m.status === 'Running' ? 'bg-green-500/20 text-green-400' : m.status === 'Idle' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                        {m.status}
                     </div>
                  </div>
               ))}
            </div>
          </section>

          {/* NEW MACHINE MODAL */}
          {isMachineModalOpen && (
             <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Register Machine</h3>
                      <button onClick={() => setIsMachineModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                         <span className="material-symbols-outlined">close</span>
                      </button>
                   </div>
                   
                   <form onSubmit={handleRegisterMachine} className="space-y-4">
                      <div>
                         <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Machine Identifier / Name</label>
                         <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" placeholder="e.g. Loom Unit 4A" value={newMachine.name} onChange={e => setNewMachine({...newMachine, name: e.target.value})} />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Equipment Type</label>
                         <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" value={newMachine.type} onChange={e => setNewMachine({...newMachine, type: e.target.value})}>
                            <option value="Loom">Loom / Weaving</option>
                            <option value="Extruder">Extruder / Tapeline</option>
                            <option value="Printer">Printing Machine</option>
                         </select>
                      </div>
                      
                      <div className="pt-4 flex gap-3">
                         <button type="button" onClick={() => setIsMachineModalOpen(false)} className="flex-1 py-2 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded hover:bg-slate-50">Cancel</button>
                         <button type="submit" disabled={isSubmittingMachine} className="flex-1 py-2 bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-sky-500 disabled:opacity-50">
                            {isSubmittingMachine ? 'Registering...' : 'Register Machine'}
                         </button>
                      </div>
                   </form>
                </div>
             </div>
          )}

          {/* Machine Utilization Dashboard */}
          <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in mb-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Machine Utilization</h4>
                <p className="text-xs text-slate-500">{data?.month || 'Current'} performance vs capacity</p>
              </div>
            </div>
            <DataTable columns={machineColumns} data={data?.machines || []} loading={isLoading} />
          </section>

          {/* RM Input Breakdown */}
          <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
            <div className="mb-8">
              <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">RM Input Breakdown (Tapeline)</h4>
              <p className="text-xs text-slate-500">Raw material consumption at Tapeline stage</p>
            </div>
            <div className="h-72 w-full">
              {isLoading ? <p className="text-slate-400">Loading chart...</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rmBreakdown} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}T`} />
                    <Tooltip formatter={v => `${v.toLocaleString()} kg`} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                    <Bar dataKey="value" fill="#00668B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </>
      )}

      {/* Daily Log Tab */}
      {activeTab === 'daily' && (
        <>
          <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
            <div className="mb-8">
              <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Daily Production Trend</h4>
              <p className="text-xs text-slate-500">Tapeline input (kg) vs Baling output (NOS) over the month</p>
            </div>
            <div className="h-80 w-full">
              {isLoading ? <p className="text-slate-400">Loading chart...</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorTapeline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00668B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00668B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBaling" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                    <Area type="monotone" dataKey="tapeline" stroke="#00668B" fill="url(#colorTapeline)" strokeWidth={2} name="Tapeline RM (kg)" />
                    <Area type="monotone" dataKey="baling" stroke="#FF6B00" fill="url(#colorBaling)" strokeWidth={2} name="Baling Output (NOS)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* Daily data table */}
          <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight mb-4">Daily Production Log</h4>
            <DataTable
              columns={[
                { header: 'Day', accessor: 'day' },
                { header: 'Tapeline RM (kg)', accessor: 'tapeline', render: (row) => <span className="font-space">{row.tapeline.toLocaleString()}</span> },
                { header: 'Baling (NOS)', accessor: 'baling', render: (row) => <span className="font-space">{row.baling.toLocaleString()}</span> },
                { header: 'Dispatch (NOS)', accessor: 'dispatch', render: (row) => <span className="font-space font-bold text-primary">{row.dispatch.toLocaleString()}</span> },
              ]}
              data={dailyTrend}
              loading={isLoading}
            />
          </section>
        </>
      )}

      {/* RM Consumption Tab */}
      {activeTab === 'rm' && (
        <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
          <div className="mb-8">
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">RM Consumption Summary</h4>
            <p className="text-xs text-slate-500">Aggregated raw material usage for the active conversion period</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rmBreakdown.map((rm, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded p-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{rm.name}</p>
                <p className="text-2xl font-bold font-space text-slate-900">{rm.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500">kg consumed</p>
              </div>
            ))}
          </div>

          {/* Efficiency Panel */}
          {data?.efficiency && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded p-5 text-center">
                <span className="material-symbols-outlined text-green-600 text-3xl mb-2">speed</span>
                <p className="text-3xl font-bold font-space text-green-700">{data.efficiency.yieldPercent.toFixed(1)}%</p>
                <p className="text-xs text-green-600 font-bold uppercase mt-1">Yield</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded p-5 text-center">
                <span className="material-symbols-outlined text-orange-600 text-3xl mb-2">delete</span>
                <p className="text-3xl font-bold font-space text-orange-700">{data.efficiency.wastagePercent.toFixed(1)}%</p>
                <p className="text-xs text-orange-600 font-bold uppercase mt-1">Wastage</p>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded p-5 text-center">
                <span className="material-symbols-outlined text-sky-600 text-3xl mb-2">scale</span>
                <p className="text-3xl font-bold font-space text-sky-700">{Math.round(data.efficiency.totalRMInput).toLocaleString()}</p>
                <p className="text-xs text-sky-600 font-bold uppercase mt-1">Total Input (kg)</p>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default Production;
