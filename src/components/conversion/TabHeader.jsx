import React from 'react';

const TabHeader = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex overflow-x-auto border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
              ${isActive 
                ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabHeader;
