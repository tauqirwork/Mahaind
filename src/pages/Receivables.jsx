import React, { useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import GlobalFilters from '../components/GlobalFilters';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

const Receivables = () => {
  const { data, isLoading, error, filters } = useDashboardData();

  const filteredData = useMemo(() => {
    let result = data.receivables;
    if (filters.client) result = result.filter(r => r.client_name === filters.client);
    if (filters.dateRange.start) result = result.filter(r => new Date(r.invoice_date) >= new Date(filters.dateRange.start));
    if (filters.dateRange.end) result = result.filter(r => new Date(r.invoice_date) <= new Date(filters.dateRange.end));
    return result;
  }, [data.receivables, filters]);

  const kpis = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      acc.total_pending += (curr.pending_amount || 0);
      acc.total_received += (curr.received_amount || 0);
      return acc;
    }, { total_pending: 0, total_received: 0 });
  }, [filteredData]);

  if (error) return <div className="text-red-500 font-bold">Failed to load data: {error.message}</div>;

  const columns = [
    { header: 'Invoice No', accessor: 'invoice_no' },
    { header: 'Date', accessor: 'invoice_date' },
    { header: 'Client', accessor: 'client_name' },
    { header: 'Inv Amount', accessor: 'invoice_amount', render: r => formatCurrency(r.invoice_amount) },
    { header: 'Received', accessor: 'received_amount', render: r => formatCurrency(r.received_amount) },
    { header: 'Pending', accessor: 'pending_amount', render: r => <span className="text-secondary font-bold">{formatCurrency(r.pending_amount)}</span> },
    { header: 'Overdue (Days)', accessor: 'days_overdue', render: r => <span className={r.days_overdue > 0 ? "text-red-600 font-bold" : ""}>{r.days_overdue}</span> }
  ];

  return (
    <>
      <section className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Receivables Tracker</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor client collections and pending accounts.</p>
        </div>
        <div className="flex gap-3">
        </div>
      </section>

      <GlobalFilters />

      <section className="grid grid-cols-12 gap-6 mb-8 animate-fade-in">
        <KpiCard 
          title="Pending Collection" 
          value={formatCurrency(kpis.total_pending)} 
          icon="warning" 
          theme="solidPrimary" 
          isSolid={true}
          trend="Overdue Notice"
        />
        <KpiCard 
          title="Total Collected" 
          value={formatCurrency(kpis.total_received)} 
          icon="verified" 
          theme="green" 
        />
      </section>

      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Pending Invoices</h4>
            <p className="text-xs text-slate-500">Unsettled accounts awaiting clearance</p>
          </div>
        </div>
        <DataTable columns={columns} data={filteredData} loading={isLoading} />
      </section>
    </>
  );
};
export default Receivables;
