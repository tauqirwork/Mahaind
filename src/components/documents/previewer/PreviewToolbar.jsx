import React from 'react';

export function PreviewToolbar({ onExport, isExporting }) {
  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center mb-6 shadow-md">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-orange-500">description</span>
        <h2 className="font-bold text-lg">Document Preview</h2>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={onExport}
          disabled={isExporting}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
            isExporting 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isExporting ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined">download</span>
          )}
          {isExporting ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}
