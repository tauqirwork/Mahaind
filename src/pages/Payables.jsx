import React, { useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import GlobalFilters from '../components/GlobalFilters';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

const Payables = () => {
  const { data, isLoading, error, filters } = useDashboardData();

  const filteredData = useMemo(() => {
    let result = data.payables;
    if (filters.vendor) result = result.filter(r => r.vendor_name === filters.vendor);
    return result;
  }, [data.payables, filters]);

  const kpis = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      acc.total_pending += (curr.pending_amount || 0);
      return acc;
    }, { total_pending: 0 });
  }, [filteredData]);

  const typeData = useMemo(() => {
    const types = {};
    filteredData.forEach(d => {
       const type = d.type || 'Other';
       if (!types[type]) types[type] = 0;
       types[type] += (d.pending_amount || 0);
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  if (error) return <div className="text-red-500 font-bold">Failed to load data</div>;

  const columns = [
    { header: 'Liability Type', accessor: 'type' },
    { header: 'Vendor / Lender Name', accessor: 'vendor_name' },
    { header: 'Outstanding Due', accessor: 'pending_amount', render: r => <span className="text-secondary font-bold">{formatCurrency(r.pending_amount)}</span> },
  ];

  const COLORS = ['#00668B', '#FF6B00', '#2E7D32', '#94A3B8', '#004D69'];

  return (
    <>
      <section className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Accounts Payable</h2>
          <p className="text-slate-500 text-sm mt-1">Track vendor liabilities and obligations.</p>
        </div>
      </section>

      <GlobalFilters />

      <section className="grid grid-cols-12 gap-8 mb-8 animate-fade-in">
        <KpiCard 
          title="Vendor Liabilities" 
          value={formatCurrency(kpis.total_pending)} 
          icon="credit_card" 
          theme="orange" 
        />
        <div className="col-span-12 md:col-span-9 bg-white border border-slate-200 rounded p-8 shadow-sm flex items-center justify-between">
            <div className="w-1/2">
                <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight mb-1">Expense Distribution</h4>
                <p className="text-xs text-slate-500 mb-4">Pie chart summary of outstanding balances.</p>
                <div className="flex gap-3 flex-wrap">
                  {typeData.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t.name}</span>
                    </div>
                  ))}
                </div>
            </div>
            <div className="h-40 w-1/2">
            {isLoading ? <p>Loading...</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="80%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    stroke="none"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                </PieChart>
              </ResponsiveContainer>
             )}
            </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Active Payables</h4>
            <p className="text-xs text-slate-500">Unsettled vendor and lender accounts</p>
          </div>
        </div>
        <DataTable columns={columns} data={filteredData} loading={isLoading} />
      </section>
    </>
  );
};
export default Payables;
