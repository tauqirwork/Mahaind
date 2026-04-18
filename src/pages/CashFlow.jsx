import React, { useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import GlobalFilters from '../components/GlobalFilters';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

const CashFlow = () => {
  const { data, isLoading, error, filters } = useDashboardData();

  const filteredData = useMemo(() => {
    let result = data.cashFlow;
    if (filters.dateRange.start) result = result.filter(r => new Date(r.transaction_date) >= new Date(filters.dateRange.start));
    if (filters.dateRange.end) result = result.filter(r => new Date(r.transaction_date) <= new Date(filters.dateRange.end));
    return result;
  }, [data.cashFlow, filters]);

  const kpis = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      acc.total_inflow += (curr.received_amount || 0);
      acc.total_outflow += (curr.paid_amount || 0);
      return acc;
    }, { total_inflow: 0, total_outflow: 0 });
  }, [filteredData]);

  const trendData = useMemo(() => {
    const dates = {};
    filteredData.forEach(d => {
      if (!dates[d.transaction_date]) dates[d.transaction_date] = { date: d.transaction_date, inflow: 0, outflow: 0 };
      dates[d.transaction_date].inflow += (d.received_amount || 0);
      dates[d.transaction_date].outflow += (d.paid_amount || 0);
    });
    return Object.values(dates).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);

  if (error) return <div className="text-red-500 font-bold">Failed to load data</div>;

  const columns = [
    { header: 'Date', accessor: 'transaction_date' },
    { header: 'Party Target', accessor: 'party_name' },
    { header: 'Transaction Hash', accessor: 'transaction_id', render: r => <span className="font-mono text-[10px] text-slate-400">{r.transaction_id}</span> },
    { header: 'Paid Out', accessor: 'paid_amount', render: r => r.paid_amount > 0 ? <span className="text-orange-600 font-bold">{formatCurrency(r.paid_amount)}</span> : '-' },
    { header: 'Received In', accessor: 'received_amount', render: r => r.received_amount > 0 ? <span className="text-green-600 font-bold">{formatCurrency(r.received_amount)}</span> : '-' },
  ];

  const netCashFlow = kpis.total_inflow - kpis.total_outflow;

  return (
    <>
      <section className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Liquidity Analysis</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time financial flow and banking velocity.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border border-slate-300 text-slate-700 rounded font-bold text-xs hover:bg-slate-50 transition-colors tracking-wider">SYNC BANK</button>
        </div>
      </section>

      <GlobalFilters />

      <section className="grid grid-cols-12 gap-6 mb-8 animate-fade-in">
        <KpiCard title="Bank Inflows" value={formatCurrency(kpis.total_inflow)} icon="transit_enterexit" theme="green" />
        <KpiCard title="Bank Outflows" value={formatCurrency(kpis.total_outflow)} icon="output" theme="orange" />
        <div className={`col-span-12 md:col-span-6 p-6 rounded shadow-lg border-b-4 relative overflow-hidden group ${netCashFlow >= 0 ? 'bg-primary border-green-400 text-white' : 'bg-secondary border-red-500 text-white'}`}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-white/20 text-white rounded">
                <span className="material-symbols-outlined">{netCashFlow >= 0 ? 'trending_up' : 'trending_down'}</span>
              </div>
            </div>
            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold mb-1 relative z-10">Net Operational Flow</p>
            <h3 className="text-3xl font-bold font-space relative z-10">{formatCurrency(netCashFlow)}</h3>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm mb-8 animate-fade-in">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Flow Delta Trend</h4>
            <p className="text-xs text-slate-500">Inbound vs outbound volume over time</p>
          </div>
        </div>
        <div className="h-72 w-full relative">
          {isLoading ? <p>Loading chart...</p> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fill: '#64748B', fontSize: 12}} />
                <YAxis tick={{fill: '#64748B', fontSize: 12}} width={80} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                <Area type="monotone" dataKey="inflow" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" />
                <Area type="monotone" dataKey="outflow" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorOutflow)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Ledger Matrix</h4>
            <p className="text-xs text-slate-500">Atomic bank entries</p>
          </div>
        </div>
        <DataTable columns={columns} data={filteredData} loading={isLoading} />
      </section>
    </>
  );
};
export default CashFlow;
