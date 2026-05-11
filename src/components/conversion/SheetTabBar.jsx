import React from 'react';

export default function SheetTabBar({ tabs, activeTab, setActiveTab }) {
  // Group tabs
  const productionTabs = tabs.filter(t => t.group === 'Production');
  const qcTabs = tabs.filter(t => t.group === 'QC Reports');

  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-6 overflow-x-auto pb-1 items-center">
        {/* Production Group */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
            Production
          </span>
          {productionTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.key
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-300 mx-2 flex-shrink-0" />

        {/* QC Reports Group */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider whitespace-nowrap bg-indigo-50 px-2 py-1 rounded">
            QC Reports
          </span>
          {qcTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
