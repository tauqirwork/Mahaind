import React from 'react';

export default function SheetDataTable({ headers, rows, loading }) {
  if (loading && rows.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Fetching sheet data...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No records found. Add a new entry to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">Row</th>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {h || `Col ${i+1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
              <td className="px-3 py-2 whitespace-nowrap text-slate-400 font-mono text-xs sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                {rowIndex + 3}
              </td>
              {Array.from({ length: Math.max(headers.length, row.length) }).map((_, colIndex) => {
                const val = row[colIndex];
                const isEmpty = val === '' || val === undefined || val === null;
                // Basic heuristic: if it looks like an error, or it's empty but headers exist
                const isFormula = isEmpty; 
                
                return (
                  <td key={colIndex} className="px-3 py-2 whitespace-nowrap">
                    {isEmpty ? (
                      <span className="text-slate-300 italic">—</span>
                    ) : (
                      <span className="text-slate-800">{val}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
