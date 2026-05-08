import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { calculateBCSFields } from '../../../utils/conversionCalculations';
import ManualInputSection from '../sections/ManualInputSection';
import AutoCalculatedSection, { AutoField } from '../sections/AutoCalculatedSection';

const BCSForm = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      client_code: '',
      shift: 'A',
      operator_name: '',
      contractor_name: '',
      bcs_machine_no: '',
      roll_no_id: '',
      bags_produced_nos: 0,
      bcs_wastage_nos: 0,
      loom_damaged_nos: 0,
      print_bopp_damaged_nos: 0,
      blade_cut_damaged_nos: 0,
      repairable_bags_nos: 0,
      tester_name: '',
      remarks: ''
    }
  });

  const values = watch();
  
  // Mock Bag Master for preview
  const mockBagMaster = { total_bag_weight_g: 50, cut_length_inch: 39.37 };

  const calculated = useMemo(() => {
    return calculateBCSFields(values, mockBagMaster);
  }, [
    values.bags_produced_nos, values.bcs_wastage_nos, values.loom_damaged_nos,
    values.print_bopp_damaged_nos, values.blade_cut_damaged_nos
  ]);

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
          <label className="block text-sm font-medium text-gray-700">Client Code *</label>
          <input type="text" {...register('client_code', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Operator *</label>
          <input type="text" {...register('operator_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contractor *</label>
          <input type="text" {...register('contractor_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">BCS Machine No. *</label>
          <input type="number" {...register('bcs_machine_no', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Roll No. (Link) *</label>
          <input type="text" placeholder="Search Roll No..." {...register('roll_no_id', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </ManualInputSection>

      <ManualInputSection title="Production & Wastage">
        <div>
          <label className="block text-sm font-medium text-gray-700">Bags Produced (Nos.) *</label>
          <input type="number" {...register('bags_produced_nos', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">BCS Wastage (Nos)</label>
          <input type="number" {...register('bcs_wastage_nos')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Loom Damaged (Nos)</label>
          <input type="number" {...register('loom_damaged_nos')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Print/BOPP Damaged (Nos)</label>
          <input type="number" {...register('print_bopp_damaged_nos')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Blade Cut Damaged (Nos)</label>
          <input type="number" {...register('blade_cut_damaged_nos')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Repairable Bags (Nos)</label>
          <input type="number" {...register('repairable_bags_nos')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tester Name *</label>
          <input type="text" {...register('tester_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Remarks</label>
          <textarea {...register('remarks')} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
        </div>
      </ManualInputSection>

      <AutoCalculatedSection>
        <AutoField label="Final Wastage" value={calculated.final_wastage_nos} unit="nos" isHighlight highlightColor="red" />
        <AutoField label="Finalised Bags" value={calculated.finalised_bags_nos} unit="nos" isHighlight />
        <AutoField label="Total Weight" value={calculated.total_weight_kg} unit="kg" />
        <AutoField label="Total Mtrs" value={calculated.total_mtrs} unit="m" />
        <AutoField label="Contractor Bill" value="Auto-calc from rate" unit="₹" />
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

export default BCSForm;
