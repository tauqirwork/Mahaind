import React from 'react';

const EntryTable = ({ entries, columns, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-100 animate-pulse rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
        No entries found for this month.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={`${entry.id}-${col.key}`} className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {col.render ? col.render(entry[col.key], entry) : entry[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntryTable;
