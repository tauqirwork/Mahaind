import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { calculateBalingFields } from '../../../utils/conversionCalculations';
import ManualInputSection from '../sections/ManualInputSection';
import AutoCalculatedSection, { AutoField } from '../sections/AutoCalculatedSection';

const BalingForm = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      client_name: '',
      bag_description: '',
      shift: 'A',
      machine_number: '',
      tailor_name: '',
      contractor_name: '',
      tester_name: '',
      finished_bags_nos: 0,
      chain_waste_kg: 0,
      damaged_bags_nos: 0,
      remarks: ''
    }
  });

  const values = watch();
  
  // Mock Bag Master and rate for preview
  const mockBagMaster = { total_bag_weight_g: 50, cut_length_inch: 39.37, bis_flag: 'NON-BIS' };
  const mockContractorRate = 0.5;

  const calculated = useMemo(() => {
    return calculateBalingFields(values, mockBagMaster, mockContractorRate);
  }, [values.finished_bags_nos]);

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
          <label className="block text-sm font-medium text-gray-700">Client Name *</label>
          <input type="text" placeholder="Search Client..." {...register('client_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bag Description *</label>
          <input type="text" placeholder="Search Bag..." {...register('bag_description', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Machine Number *</label>
          <input type="number" {...register('machine_number', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tailor Name *</label>
          <input type="text" {...register('tailor_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contractor Name *</label>
          <input type="text" {...register('contractor_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tester Name *</label>
          <input type="text" {...register('tester_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </ManualInputSection>

      <ManualInputSection title="Production & Wastage">
        <div>
          <label className="block text-sm font-medium text-gray-700">Finished Stitched Bags (Nos) *</label>
          <input type="number" {...register('finished_bags_nos', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Chain Waste (kg)</label>
          <input type="number" step="0.001" {...register('chain_waste_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Damaged Bags (Nos)</label>
          <input type="number" {...register('damaged_bags_nos')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700">Remarks</label>
          <textarea {...register('remarks')} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
        </div>
      </ManualInputSection>

      <AutoCalculatedSection>
        <AutoField label="Bag Weight" value={calculated.bag_weight_g} unit="g" />
        <AutoField label="Cut Length" value={calculated.cut_length_inch} unit="inch" />
        <AutoField label="Total Mtrs" value={calculated.total_mtrs} unit="m" />
        <AutoField label="BIS/NON-BIS" value={calculated.bis_flag} />
        <AutoField label="Contractor Bill" value={calculated.contractor_bill} unit="₹" isHighlight />
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

export default BalingForm;
