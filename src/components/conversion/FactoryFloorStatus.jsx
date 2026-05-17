import React, { useState, useEffect } from 'react';
import { fetchFloorStatus } from '../../services/sheetsApi';
import { useDashboardData } from '../../hooks/useDashboardData';

export default function FactoryFloorStatus() {
  const { data: dashboardData } = useDashboardData();
  const [data, setData] = useState({
    rollsOnFloor: 0,
    rollsAtPrinting: 0,
    rollsAtBOPP: 0,
    totalBales: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const result = await fetchFloorStatus();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch floor status", error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex justify-center items-center h-24">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined animate-spin text-lg">sync</span>
          <span className="text-sm font-medium">Loading floor status...</span>
        </div>
      </div>
    );
  }

  const dispatchRecords = dashboardData?.dispatch || [];
  const totalBagsDispatched = dispatchRecords.reduce((sum, d) => sum + (d.quantity || 0), 0);
  const balesDispatched = totalBagsDispatched / 500;
  const balesOnFloor = Math.max(0, data.totalBales - balesDispatched);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-slate-400 text-lg">inventory_2</span>
          <div className="text-sm text-slate-500 font-medium">Rolls on Floor</div>
        </div>
        <div className="text-3xl font-bold text-slate-800">{data.rollsOnFloor}</div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-sky-500 text-lg">print</span>
          <div className="text-sm text-slate-500 font-medium">Rolls at Printing</div>
        </div>
        <div className="text-3xl font-bold text-sky-600">{data.rollsAtPrinting}</div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-indigo-500 text-lg">layers</span>
          <div className="text-sm text-slate-500 font-medium">Rolls at BOPP</div>
        </div>
        <div className="text-3xl font-bold text-indigo-600">{data.rollsAtBOPP}</div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-emerald-500 text-lg">package_2</span>
          <div className="text-sm text-slate-500 font-medium">Bales on Floor</div>
        </div>
        <div className="text-3xl font-bold text-emerald-600">
          {Number.isInteger(balesOnFloor) ? balesOnFloor : balesOnFloor.toFixed(1)}
        </div>
      </div>
    </div>
  );
}
