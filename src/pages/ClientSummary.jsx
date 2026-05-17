import React, { useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import GlobalFilters from '../components/GlobalFilters';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

const ClientSummary = () => {
  const { data, isLoading, error, filters } = useDashboardData();

  const filteredData = useMemo(() => {
    let result = data.clientSummary;
    if (filters.client) result = result.filter(r => r.client_name === filters.client);
    return result;
  }, [data.clientSummary, filters]);

  const kpis = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      acc.total_invoice += (curr.total_invoice_amount || 0);
      acc.total_received += (curr.total_received_amount || 0);
      acc.total_pending += (curr.total_pending_amount || 0);
      return acc;
    }, { total_invoice: 0, total_received: 0, total_pending: 0 });
  }, [filteredData]);

  const topClients = useMemo(() => {
    return [...filteredData].sort((a, b) => (b.total_pending_amount || 0) - (a.total_pending_amount || 0)).slice(0, 5);
  }, [filteredData]);

  // Aging Analysis for Receivables (Mock metric extraction for donut)
  const agingData = useMemo(() => {
    const active = data.receivables || [];
    let bucket30 = 0, bucket60 = 0, bucket90 = 0, bucket90Plus = 0;

    active.forEach(r => {
      const days = r.days_overdue || 0;
      const amt = r.pending_amount || 0;
      if (days <= 30) bucket30 += amt;
      else if (days <= 60) bucket60 += amt;
      else if (days <= 90) bucket90 += amt;
      else bucket90Plus += amt;
    });

    return [
      { name: '0-30 Days', value: bucket30, color: '#38bdf8' },
      { name: '31-60 Days', value: bucket60, color: '#fb923c' },
      { name: '61-90 Days', value: bucket90, color: '#f43f5e' },
      { name: '90+ Days', value: bucket90Plus, color: '#94a3b8' }
    ].filter(d => d.value > 0);
  }, [data.receivables]);

  // Dispatch Trend (Monthly/Weekly pseudo grouping)
  const dispatchTrend = useMemo(() => {
    const logs = data.dispatch || [];
    const trends = logs.reduce((acc, log) => {
      // use week or date
      const period = log.week || 'Wk-0';
      if (!acc[period]) acc[period] = { name: period, volume: 0, amount: 0 };
      acc[period].volume += (log.quantity || 0);
      acc[period].amount += (log.total_amount_gst || 0);
      return acc;
    }, {});

    // Get last 8 periods sorted alphabetically/chronologically
    return Object.values(trends).sort((a, b) => a.name.localeCompare(b.name)).slice(-8);
  }, [data.dispatch]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (error) return <div className="text-red-500 font-bold">Failed to load data: {error.message}</div>;

  const columns = [
    { header: 'Client Name', accessor: 'client_name' },
    { header: 'Responsible Person', accessor: 'responsible_person' },
    { header: 'Invoice Amount', accessor: 'total_invoice_amount', render: (row) => formatCurrency(row.total_invoice_amount) },
    { header: 'Received Amount', accessor: 'total_received_amount', render: (row) => formatCurrency(row.total_received_amount) },
    { header: 'Pending Amount', accessor: 'total_pending_amount', render: (row) => <span className="text-secondary font-bold">{formatCurrency(row.total_pending_amount)}</span> },
  ];

  return (
    <>
      <section className="flex justify-between items-end animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Client Summary</h2>
          <p className="text-slate-500 text-sm mt-1">Overview of all client invoices and pending balances.</p>
        </div>
        <div className="flex gap-3">
        </div>
      </section>

      <section className="mt-8">
        <GlobalFilters />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-fade-in">
        <KpiCard title="Total Invoiced" value={formatCurrency(kpis.total_invoice)} icon="receipt_long" theme="sky" />
        <KpiCard title="Total Received" value={formatCurrency(kpis.total_received)} icon="trending_up" theme="green" />
        <KpiCard title="Total Pending" value={formatCurrency(kpis.total_pending)} icon="warning" theme="solidPrimary" isSolid={true} trend={`${kpis.total_invoice ? ((kpis.total_received / kpis.total_invoice) * 100).toFixed(1) : 0}% Collected`} />


      </section>

      <section className="grid grid-cols-12 gap-8 mb-8">

        {/* Logistics Trend */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Logistics Output Volume</h4>
              <p className="text-xs text-slate-500">Dispatch quantities mapped over recent operational periods</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {isLoading ? <div className="animate-pulse bg-slate-100 h-full rounded w-full"></div> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dispatchTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <RechartsTooltip cursor={{ fill: '#F8FAFC', stroke: '#E2E8F0' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" name="Dispatched Bags (Qty)" dataKey="volume" stroke="#0ea5e9" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Aging Pie Chart */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded p-8 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Receivables Aging</h4>
            <p className="text-xs text-slate-500">Distribution of outstanding limits</p>
          </div>
          <div className="h-[300px] w-full relative flex items-center justify-center">
            {isLoading ? <div className="animate-pulse bg-slate-100 w-full h-full rounded-full max-w-[200px]"></div> : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={agingData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                      {agingData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">At Risk</span>
                  <span className="text-xl font-bold font-space text-slate-800">
                    {agingData.length > 2 ? '⚠️' : '✅'}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {agingData.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Top Pending Horizontal */}
        <div className="col-span-12 bg-white border border-slate-200 rounded p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Financial Exposure: Top Accounts</h4>
              <p className="text-xs text-slate-500">Highest outstanding accounts sorted by pending liquidity</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            {isLoading ? <div className="animate-pulse bg-slate-100 h-full rounded w-full"></div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClients} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                  <YAxis type="category" dataKey="client_name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} width={140} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: '#F1F5F9' }} formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="total_pending_amount" name="Pending Balance" fill="#ff7e27" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </section>

      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Client Ledger Master</h4>
            <p className="text-xs text-slate-500">Comprehensive list of client financial states</p>
          </div>
        </div>
        <DataTable columns={columns} data={filteredData} loading={isLoading} />
      </section>
    </>
  );
};

export default ClientSummary;
