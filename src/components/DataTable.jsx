import React from 'react';

const DataTable = ({ columns, data, loading = false }) => {
  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-label text-sm">Loading records...</div>;
  }
  
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-label text-sm">No records found.</div>;
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded shadow-sm bg-white">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
              {columns.map((col, colIndex) => {
                const cellValue = row[col.accessor];
                // Styling the first column slightly bolder like the design
                const isFirst = colIndex === 0;
                return (
                  <td 
                    key={colIndex} 
                    className={`py-4 px-4 text-xs ${isFirst ? 'font-space font-bold text-slate-900 text-sm' : 'font-medium text-slate-600'}`}
                  >
                    {col.render ? col.render(row, cellValue) : cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
