import React, { useState } from 'react';
import AttendanceGrid from './AttendanceGrid';
import PayrollDashboard from './PayrollDashboard';

const PayrollModule = () => {
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center border-b border-slate-200 px-4 pt-4 bg-slate-50">
        <button
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'attendance'
              ? 'border-sky-600 text-sky-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance Grid
        </button>
        <button
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'payroll'
              ? 'border-sky-600 text-sky-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('payroll')}
        >
          Payroll Dashboard
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-4">
        {activeTab === 'attendance' && <AttendanceGrid />}
        {activeTab === 'payroll' && <PayrollDashboard />}
      </div>
    </div>
  );
};

export default PayrollModule;
