import React, { useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import GlobalFilters from '../components/GlobalFilters';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dispatch = () => {
  const { data, isLoading, error, filters } = useDashboardData();

  const filteredData = useMemo(() => {
    let result = [...data.dispatch];
    if (filters.client) result = result.filter(r => r.client_name === filters.client);
    if (filters.dateRange.start) result = result.filter(r => new Date(r.date) >= new Date(filters.dateRange.start));
    if (filters.dateRange.end) result = result.filter(r => new Date(r.date) <= new Date(filters.dateRange.end));
    
    if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(r => 
            String(r.client_name || '').toLowerCase().includes(q) ||
            String(r.bag_description || '').toLowerCase().includes(q) ||
            String(r.invoice_no || '').toLowerCase().includes(q) ||
            String(r.transporter || '').toLowerCase().includes(q)
        );
    }
    
    // Sort strictly from newest to oldest
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    return result;
  }, [data.dispatch, filters]);

  const kpis = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      acc.total_quantity += (curr.quantity || 0);
      acc.total_value += (curr.total_amount_gst || 0);
      return acc;
    }, { total_quantity: 0, total_value: 0 });
  }, [filteredData]);

  const trendData = useMemo(() => {
    const dates = {};
    filteredData.forEach(d => {
      if (!dates[d.date]) dates[d.date] = { date: d.date, quantity: 0 };
      dates[d.date].quantity += (d.quantity || 0);
    });
    return Object.values(dates).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);

  if (error) return <div className="text-red-500 font-bold">Failed to load data: {error.message}</div>;

  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Client', accessor: 'client_name' },
    { header: 'Bag Description', accessor: 'bag_description' },
    { header: 'Qty', accessor: 'quantity' },
    { header: 'Unit', accessor: 'unit' },
    { header: 'Transporter', accessor: 'transporter' },
    { header: 'Invoice No', accessor: 'invoice_no' }
  ];

  return (
    <>
      <section className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Dispatch Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Track outgoing shipments and quantity fulfillment.</p>
        </div>
        <div className="flex gap-3">
          {/* Export buttons centralized to Reports Module in V0 */}
        </div>
      </section>

      <GlobalFilters />

      <section className="grid grid-cols-12 gap-6 mb-8 animate-fade-in">
        <KpiCard 
          title="Total Quantity Dispatched" 
          value={Math.round(kpis.total_quantity).toLocaleString()} 
          subtitle="Overall aggregate" 
          icon="conveyor_belt" 
          theme="sky" 
        />
        <KpiCard 
          title="Total Dispatch Value (INR)" 
          value={`$${Math.round(kpis.total_value).toLocaleString()}`} 
          subtitle="Includes GST" 
          icon="activity" 
          theme="solidPrimary" 
          isSolid={true}
        />
      </section>

      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm mb-8 animate-fade-in">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Quantity Trend</h4>
            <p className="text-xs text-slate-500">Historical dispatch volume</p>
          </div>
        </div>
        <div className="h-64 w-full relative">
          {isLoading ? <p>Loading chart...</p> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00668B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00668B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fill: '#64748B', fontSize: 12}} />
                <YAxis tick={{fill: '#64748B', fontSize: 12}} width={40} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                <Area type="monotone" dataKey="quantity" stroke="#00668B" fillOpacity={1} fill="url(#colorQty)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Dispatch Records</h4>
            <p className="text-xs text-slate-500">Continuous logistics logger</p>
          </div>
        </div>
        <DataTable columns={columns} data={filteredData} loading={isLoading} />
      </section>
    </>
  );
};

export default Dispatch;
