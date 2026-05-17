import React, { useState } from 'react';
import { useSheetData } from '../hooks/useSheetData';
import SheetDataTable from '../components/conversion/SheetDataTable';
import EntryFormDrawer from '../components/conversion/EntryFormDrawer';
import SheetTabBar from '../components/conversion/SheetTabBar';
import FactoryFloorStatus from '../components/conversion/FactoryFloorStatus';

export const TABS = [
  // --- PRODUCTION ---
  { key: 'tapeline',          label: 'Tapeline',         group: 'Production' },
  { key: 'rolldown',          label: 'Roll Down',        group: 'Production' },
  { key: 'liner',             label: 'Liner',            group: 'Production' },
  { key: 'printing',          label: 'Printing',         group: 'Production' },
  { key: 'bopp',              label: 'BOPP / Lam',       group: 'Production' },
  { key: 'bcs',               label: 'BCS',              group: 'Production' },
  { key: 'baling',            label: 'Baling',           group: 'Production' },

  // --- QC REPORTS ---
  { key: 'loom_qc',           label: 'Loom QC',          group: 'QC Reports' },
  { key: 'liner_qc',          label: 'Liner QC',         group: 'QC Reports' },
  { key: 'printing_qc',       label: 'Printing QC',      group: 'QC Reports' },
  { key: 'printing_ink_qc',   label: 'Print Ink QC',     group: 'QC Reports' },
  { key: 'bopp_qc',           label: 'BOPP QC',          group: 'QC Reports' },
  { key: 'bcs_qc',            label: 'BCS QC',           group: 'QC Reports' },
  { key: 'manual_stitch_qc',  label: 'Stitching QC',     group: 'QC Reports' },
];

export default function ConversionSheets() {
  const [activeTab, setActiveTab] = useState('tapeline');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { data, loading, error, reload, setData } = useSheetData(activeTab);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleEntrySuccess = (newRow, rowNum) => {
    setIsDrawerOpen(false);
    showToast(`Success! Entry added at row ${rowNum}`);
    // Append to bottom of local state to match sheet order
    setData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Conversion Sheets</h2>
          <p className="text-slate-500 text-sm mt-1">Direct Google Sheets integration for production tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={reload}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
            title="Refresh Table"
          >
            <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>sync</span>
          </button>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded text-[11px] font-bold tracking-wider transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            ADD ENTRY
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Factory Floor Status Widget */}
      <FactoryFloorStatus />

      {/* Tabs */}
      <SheetTabBar tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Table */}
      <SheetDataTable headers={data.headers} rows={data.rows} loading={loading} />

      <EntryFormDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        activeTab={activeTab}
        onSubmitSuccess={handleEntrySuccess}
      />

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded shadow-xl flex items-center gap-2 animate-fade-in z-50">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
