import React, { useState, useEffect } from 'react';
import TabHeader from '../components/conversion/TabHeader';
import KPIBar from '../components/conversion/KPIBar';
import EntryTable from '../components/conversion/EntryTable';
import AddEntryModal from '../components/conversion/AddEntryModal';
import TapelineForm from '../components/conversion/forms/TapelineForm';
import RolldownForm from '../components/conversion/forms/RolldownForm';
import LinerForm from '../components/conversion/forms/LinerForm';
import PrintingForm from '../components/conversion/forms/PrintingForm';
import BOPPForm from '../components/conversion/forms/BOPPForm';
import BCSForm from '../components/conversion/forms/BCSForm';
import BalingForm from '../components/conversion/forms/BalingForm';
import { getEntries, getSummary, createEntry } from '../services/conversionService';
// Import other forms as needed

const TABS = [
  { id: 'tapeline', label: 'Tapeline', icon: '⚙️' },
  { id: 'rolldown', label: 'Roll Down', icon: '🎞️' },
  { id: 'liner', label: 'Liner', icon: '📦' },
  { id: 'printing', label: 'Printing', icon: '🖨️' },
  { id: 'bopp', label: 'BOPP / Lam', icon: '✨' },
  { id: 'bcs', label: 'BCS', icon: '✂️' },
  { id: 'baling', label: 'Baling', icon: '📫' },
];

const COLUMNS = {
  tapeline: [
    { key: 'entry_date', label: 'Date' },
    { key: 'shift', label: 'Shift' },
    { key: 'client_code', label: 'Client' },
    { key: 'operator_name', label: 'Operator' },
    { key: 'total_input_kg', label: 'Input (kg)' },
    { key: 'total_wastage_kg', label: 'Wastage (kg)' },
    { key: 'tp_code', label: 'TP Code' },
  ],
  rolldown: [
    { key: 'entry_date', label: 'Date' },
    { key: 'shift', label: 'Shift' },
    { key: 'loom_no', label: 'Loom No.' },
    { key: 'roll_no', label: 'Roll No.' },
    { key: 'roll_fabric_mtrs', label: 'Fabric (m)' },
    { key: 'roll_net_wt_kg', label: 'Weight (kg)' },
    { key: 'actual_meter_wt_g', label: 'Actual Meter Wt (g)' },
  ],
  liner: [
    { key: 'entry_date', label: 'Date' },
    { key: 'shift', label: 'Shift' },
    { key: 'client_code', label: 'Client Code' },
    { key: 'machine_no', label: 'Machine' },
    { key: 'total_rm_kg', label: 'Total RM (kg)' },
    { key: 'liner_wastage_kg', label: 'Wastage (kg)' },
  ],
  printing: [
    { key: 'entry_date', label: 'Date' },
    { key: 'shift', label: 'Shift' },
    { key: 'machine_name', label: 'Machine' },
    { key: 'roll_no_id', label: 'Roll No.' },
    { key: 'printed_fabric_m', label: 'Printed (m)' },
    { key: 'ink_wastage_kg', label: 'Ink Wastage (kg)' },
  ],
  bopp: [
    { key: 'entry_date', label: 'Date' },
    { key: 'shift', label: 'Shift' },
    { key: 'operator_name', label: 'Operator' },
    { key: 'bcs_machine_no', label: 'BCS Machine' },
    { key: 'roll_no_id', label: 'Roll No.' },
    { key: 'bags_produced_nos', label: 'Bags Produced' },
  ],
  bcs: [
    { key: 'entry_date', label: 'Date' },
    { key: 'shift', label: 'Shift' },
    { key: 'client_code', label: 'Client' },
    { key: 'roll_no_id', label: 'Roll No.' },
    { key: 'bags_produced_nos', label: 'Bags Produced' },
    { key: 'final_wastage_nos', label: 'Wastage (nos)' },
    { key: 'total_weight_kg', label: 'Total Weight (kg)' },
  ],
  baling: [
    { key: 'entry_date', label: 'Date' },
    { key: 'shift', label: 'Shift' },
    { key: 'client_name', label: 'Client' },
    { key: 'bag_description', label: 'Bag Description' },
    { key: 'machine_number', label: 'Machine' },
    { key: 'finished_bags_nos', label: 'Finished Bags' },
    { key: 'damaged_bags_nos', label: 'Damaged' },
  ]
};

const ConversionSheet = () => {
  const [activeTab, setActiveTab] = useState('tapeline');
  const [selectedMonth, setSelectedMonth] = useState('Apr\'26'); // Make this dynamic based on current month
  const [showAddModal, setShowAddModal] = useState(false);
  const [entries, setEntries] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedMonth]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getEntries(activeTab, selectedMonth);
      setEntries(data || []);
      setKpiData({
        'total_input_kg': 0,
        'total_wastage_kg': 0,
        'efficiency': '0%'
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      data.month = selectedMonth;
      await createEntry(activeTab, data);
      setShowAddModal(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to create entry:', error);
      alert('Error creating entry: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Conversion Sheets</h1>
          <p className="text-slate-500">Manage production records across all stages</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="Apr'26">Apr'26</option>
            <option value="May'26">May'26</option>
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add New Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <TabHeader tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <KPIBar data={kpiData} isLoading={isLoading} />

      <div className="mt-6">
        <EntryTable 
          entries={entries} 
          columns={COLUMNS[activeTab] || []} 
          isLoading={isLoading} 
        />
      </div>

      <AddEntryModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title={`Add New ${TABS.find(t => t.id === activeTab)?.label} Entry`}
      >
        {activeTab === 'tapeline' && <TapelineForm onSubmit={handleAddSubmit} isSubmitting={isSubmitting} />}
        {activeTab === 'rolldown' && <RolldownForm onSubmit={handleAddSubmit} isSubmitting={isSubmitting} />}
        {activeTab === 'liner' && <LinerForm onSubmit={handleAddSubmit} isSubmitting={isSubmitting} />}
        {activeTab === 'printing' && <PrintingForm onSubmit={handleAddSubmit} isSubmitting={isSubmitting} />}
        {activeTab === 'bopp' && <BOPPForm onSubmit={handleAddSubmit} isSubmitting={isSubmitting} />}
        {activeTab === 'bcs' && <BCSForm onSubmit={handleAddSubmit} isSubmitting={isSubmitting} />}
        {activeTab === 'baling' && <BalingForm onSubmit={handleAddSubmit} isSubmitting={isSubmitting} />}
      </AddEntryModal>
    </div>
  );
};

export default ConversionSheet;
