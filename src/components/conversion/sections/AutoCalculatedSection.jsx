import React from 'react';

const AutoCalculatedSection = ({ children, title = 'Auto-Calculated Fields (Live Preview)' }) => {
  return (
    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
};

export const AutoField = ({ label, value, unit = '', isHighlight = false, highlightColor = 'green' }) => (
  <div className={`p-3 rounded border ${isHighlight ? `bg-${highlightColor}-50 border-${highlightColor}-200` : 'bg-white border-slate-200'}`}>
    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-medium">{label}</div>
    <div className={`font-bold text-lg ${isHighlight ? `text-${highlightColor}-700` : 'text-slate-800'}`}>
      {value !== undefined && value !== null ? value : '-'} {unit}
    </div>
  </div>
);

export default AutoCalculatedSection;
