import React from 'react';

const KPIBar = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow animate-pulse flex gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            {key.replace(/_/g, ' ')}
          </span>
          <span className="text-2xl font-bold text-gray-800">
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default KPIBar;
