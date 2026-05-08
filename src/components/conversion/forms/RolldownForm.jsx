import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { calculateRolldownFields } from '../../../utils/conversionCalculations';
import ManualInputSection from '../sections/ManualInputSection';
import AutoCalculatedSection, { AutoField } from '../sections/AutoCalculatedSection';

const RolldownForm = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      shift: 'A',
      loom_no: '',
      roll_no: '',
      roll_fabric_mtrs: 0,
      roll_net_wt_kg: 0,
      loom_wastage_kg: 0,
      tp_code_id: '' // Searchable dropdown id in a real implementation
    }
  });

  const values = watch();
  
  // Mock Bag Master data for live preview
  const mockBagMaster = { meter_weight_g: 100 };
  const mockLabourRate = 0.5;

  const calculated = useMemo(() => {
    return calculateRolldownFields(values, mockBagMaster, mockLabourRate);
  }, [values.roll_fabric_mtrs, values.roll_net_wt_kg]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ManualInputSection title="General Details">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <input type="date" {...register('entry_date', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Shift *</label>
          <select {...register('shift')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="A">Shift A</option>
            <option value="B">Shift B</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Loom No. *</label>
          <input type="number" {...register('loom_no', { required: true, min: 1, max: 35 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">TP Code (Link) *</label>
          <input type="text" placeholder="Select TP Code..." {...register('tp_code_id')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">QC Name *</label>
          <input type="text" {...register('qc_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </ManualInputSection>

      <ManualInputSection title="Roll Details">
        <div>
          <label className="block text-sm font-medium text-gray-700">Roll No. *</label>
          <input type="text" {...register('roll_no', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="e.g. 1D, 2D" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Roll Fabric (mtrs) *</label>
          <input type="number" step="0.01" {...register('roll_fabric_mtrs', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Roll Net Wt (kg) *</label>
          <input type="number" step="0.01" {...register('roll_net_wt_kg', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Loom Wastage (kg)</label>
          <input type="number" step="0.01" {...register('loom_wastage_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Issue To *</label>
          <select {...register('issue_to', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="PRINTING">PRINTING</option>
            <option value="BOPP/LAM">BOPP/LAM</option>
            <option value="ON FLOOR">ON FLOOR</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700">Remarks</label>
          <textarea {...register('remarks')} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
        </div>
      </ManualInputSection>

      <AutoCalculatedSection>
        <AutoField label="Client Name" value="Auto-filled from TP" />
        <AutoField label="Fabric Description" value="Auto-filled from Bag Master" />
        <AutoField label="Actual Meter Wt" value={calculated.actual_meter_wt_g} unit="g" isHighlight />
        <AutoField label="Req Meter Wt" value={calculated.req_meter_wt_g} unit="g" />
        <AutoField label="Labour Cost" value={calculated.labour_cost} unit="₹" />
      </AutoCalculatedSection>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
};

export default RolldownForm;
