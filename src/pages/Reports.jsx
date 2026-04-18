import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { generateDataReport } from '../utils/pdfEngine';

const Reports = () => {
  const { data } = useDashboardData();

  const handleExportClientStatement = () => {
    // Generate an export from global mock data
    const cols = [
      { header: 'Invoice No', accessor: 'invoice_no' },
      { header: 'Client', accessor: 'client_name' },
      { header: 'Inv Amount', accessor: 'invoice_amount' },
      { header: 'Pending', accessor: 'pending_amount' }
    ];
    generateDataReport("Client Statement Master", cols, data.receivables || []);
  };

  const handleExportInventory = () => {
    const cols = [
      { header: 'Material Category', accessor: 'category' },
      { header: 'Total Value (Rs)', accessor: 'total_value' }
    ];
    generateDataReport("Inventory Valuation Report", cols, data.inventory || []);
  };

  const handleExportDispatch = () => {
    const cols = [
      { header: 'Date', accessor: 'date' },
      { header: 'Client', accessor: 'client' },
      { header: 'Quantity (NOS)', accessor: 'quantity' },
      { header: 'Vehicle No', accessor: 'vehicle_no' }
    ];
    generateDataReport("Monthly Dispatch Log", cols, data.dispatchLog || []);
  };

  return (
    <>
      <section className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Centralized Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Export detailed records and filtered data across all plant modules.</p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
        <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight mb-6">Available Exports</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="border border-slate-200 rounded p-5 hover:border-sky-300 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-sky-50 rounded flex justify-center items-center text-sky-600 group-hover:bg-primary group-hover:text-white transition-colors">
                 <span className="material-symbols-outlined">description</span>
              </div>
              <h5 className="font-bold text-slate-800">Client Statement</h5>
            </div>
            <p className="text-xs text-slate-500 mb-4 h-8">Full historical ledger of pending and paid invoices per client.</p>
            <button onClick={handleExportClientStatement} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs tracking-wider transition-colors">EXPORT DATA</button>
          </div>

          <div className="border border-slate-200 rounded p-5 hover:border-orange-300 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded flex justify-center items-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                 <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <h5 className="font-bold text-slate-800">Dispatch Report</h5>
            </div>
            <p className="text-xs text-slate-500 mb-4 h-8">Summary of outgoing logistics quantities and invoices.</p>
            <button onClick={handleExportDispatch} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs tracking-wider transition-colors">DOWNLOAD REPORT</button>
          </div>

          <div className="border border-slate-200 rounded p-5 hover:border-green-300 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded flex justify-center items-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                 <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <h5 className="font-bold text-slate-800">Inventory Stock</h5>
            </div>
            <p className="text-xs text-slate-500 mb-4 h-8">Valuation and live balances for all raw materials.</p>
            <button onClick={handleExportInventory} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs tracking-wider transition-colors">EXPORT DATA</button>
          </div>
          
          <div className="border border-slate-200 rounded p-5 hover:border-purple-300 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded flex justify-center items-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                 <span className="material-symbols-outlined">payments</span>
              </div>
              <h5 className="font-bold text-slate-800">Receivables Ledger</h5>
            </div>
            <p className="text-xs text-slate-500 mb-4 h-8">Outstanding overdue invoices across all clients.</p>
            <button onClick={handleExportClientStatement} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs tracking-wider transition-colors">EXPORT LEDGER</button>
          </div>

        </div>
      </section>
    </>
  );
};

export default Reports;
