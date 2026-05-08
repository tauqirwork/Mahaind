import React from 'react';
import { useForm } from 'react-hook-form';
import ManualInputSection from '../sections/ManualInputSection';
import AutoCalculatedSection, { AutoField } from '../sections/AutoCalculatedSection';

const BOPPForm = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      shift: 'A',
      operator_name: '',
      contractor_name: '',
      bcs_machine_no: '',
      roll_no_id: '',
      bags_produced_nos: 0
    }
  });

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
          <label className="block text-sm font-medium text-gray-700">Operator *</label>
          <input type="text" {...register('operator_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contractor Name *</label>
          <input type="text" {...register('contractor_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </ManualInputSection>

      <ManualInputSection title="Production Details">
        <div>
          <label className="block text-sm font-medium text-gray-700">BCS Machine Number *</label>
          <input type="number" {...register('bcs_machine_no', { required: true, min: 1, max: 4 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Roll No. (Link) *</label>
          <input type="text" placeholder="Search Roll No..." {...register('roll_no_id', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bags Produced (Nos.) *</label>
          <input type="number" {...register('bags_produced_nos', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </ManualInputSection>

      <AutoCalculatedSection>
        <AutoField label="Client Name" value="Auto from Roll" />
        <AutoField label="Bag Description" value="Auto from Master" />
        <AutoField label="Fabric Description" value="Auto from Roll" />
        <AutoField label="Fabric Input" value="-" unit="m" />
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

export default BOPPForm;
