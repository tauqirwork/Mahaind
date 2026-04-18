import React, { useState, useEffect, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import { fetchInventoryData } from '../services/inventoryService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

const Inventory = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await fetchInventoryData();
        setData(result);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredStock = useMemo(() => {
    if (!data?.detail?.aggregated) return [];
    if (!searchTerm) return data.detail.aggregated;
    return data.detail.aggregated.filter(rm =>
      rm.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const departmentChartData = useMemo(() => {
    if (!data?.summary?.departments) return [];
    return data.summary.departments.filter(d => d.amount > 0);
  }, [data]);

  const materialChartData = useMemo(() => {
    if (!data?.summary?.materialTypes) return [];
    return data.summary.materialTypes.filter(m => m.amount > 0).slice(0, 12);
  }, [data]);

  if (error) return <div className="text-red-500 font-bold p-8">Failed to load inventory data: {error.message}</div>;

  const stockColumns = [
    { header: 'Raw Material', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    { header: 'Quantity', accessor: 'totalQuantity', render: (row) => <span className="font-space font-bold">{Math.round(row.totalQuantity).toLocaleString()}</span> },
    { header: 'Unit', accessor: 'unit' },
    { header: 'Avg Price', accessor: 'avgPrice', render: (row) => formatCurrency(row.avgPrice) },
    { header: 'Total Value', accessor: 'totalValue', render: (row) => <span className="text-primary font-bold">{formatCurrency(row.totalValue)}</span> },
  ];

  const COLORS = ['#00668B', '#FF6B00', '#2E7D32', '#7C3AED', '#DB2777', '#059669', '#D97706', '#4F46E5'];

  return (
    <>
      {/* Header */}
      <section className="flex justify-between items-end animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Raw Material Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">Track real-time stock levels, consumption, and alerts.</p>
        </div>
        <div className="flex gap-3">
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-12 gap-6 animate-fade-in">
        <KpiCard
          title="Total Stock Value"
          value={isLoading ? '—' : formatCurrency(data?.detail?.totalStockValue)}
          icon="inventory_2"
          theme="solidPrimary"
          isSolid={true}
          subtitle="Current valuation"
        />
        <KpiCard
          title="Material Categories"
          value={isLoading ? '—' : data?.summary?.materialTypes?.length || 0}
          icon="category"
          theme="sky"
        />
        <KpiCard
          title="Departments"
          value={isLoading ? '—' : data?.summary?.departments?.length || 0}
          icon="domain"
          theme="green"
        />
        <KpiCard
          title="Active Alerts"
          value={isLoading ? '—' : data?.alerts?.length || 0}
          icon="warning"
          theme="orange"
        />
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-12 gap-8 animate-fade-in">
        {/* Department-wise Stock */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded p-8 shadow-sm">
          <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight mb-1">Stock by Department</h4>
          <p className="text-xs text-slate-500 mb-8">Distribution across plant departments</p>
          <div className="h-72 w-full">
            {isLoading ? <p className="text-slate-400">Loading chart...</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {departmentChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Material-type-wise Stock */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded p-8 shadow-sm">
          <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight mb-1">Stock by Material Type</h4>
          <p className="text-xs text-slate-500 mb-8">Top materials by value</p>
          <div className="h-72 w-full">
            {isLoading ? <p className="text-slate-400">Loading chart...</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialChartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} width={75} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="amount" fill="#FF6B00" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Alerts Panel */}
      {data?.alerts?.length > 0 && (
        <section className="bg-orange-50 border border-orange-200 rounded p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-orange-600">warning</span>
            <h4 className="text-lg font-bold font-space text-orange-800 uppercase tracking-tight">Stock Alerts</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.alerts.map((alert, i) => (
              <div key={i} className="bg-white border border-orange-200 rounded p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-orange-500 mt-0.5">error</span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{alert.material}</p>
                  <p className="text-xs text-slate-600">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stock Table */}
      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Raw Material Stock Register</h4>
            <p className="text-xs text-slate-500">Detailed inventory of all raw materials</p>
          </div>
          <div className="flex items-center bg-slate-100 rounded px-4 py-2 w-64">
            <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full focus:outline-none ml-2 placeholder:text-slate-400"
              placeholder="Search material..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <DataTable columns={stockColumns} data={filteredStock} loading={isLoading} />
      </section>
    </>
  );
};

export default Inventory;
