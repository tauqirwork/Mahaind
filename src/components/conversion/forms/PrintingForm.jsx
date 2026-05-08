import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import ManualInputSection from '../sections/ManualInputSection';
import AutoCalculatedSection, { AutoField } from '../sections/AutoCalculatedSection';

const PrintingForm = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      shift: 'A',
      machine_name: '',
      operator_name: '',
      roll_no_id: '',
      ink_wastage_kg: 0,
      reducer_wastage_kg: 0,
      test_printing_bags_nos: 0,
      issue_to_bcs_machine_no: ''
    }
  });

  const values = watch();

  const calculated = useMemo(() => {
    // Mock values since they come from Roll Down in reality
    const printed_fabric_m = 1000;
    const rate = 1.5;
    const final_print_fabric_m = printed_fabric_m - (parseFloat(values.test_printing_bags_nos) || 0) * 0.5; // Mock adjustment
    const contractor_bill = (printed_fabric_m / 100) * rate;

    return {
      printed_fabric_m,
      final_print_fabric_m: parseFloat(final_print_fabric_m.toFixed(2)),
      contractor_bill: parseFloat(contractor_bill.toFixed(2))
    };
  }, [values.test_printing_bags_nos]);

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
          <label className="block text-sm font-medium text-gray-700">Machine Name *</label>
          <select {...register('machine_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="PNRM">PNRM</option>
            <option value="JP Online">JP Online</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Operator *</label>
          <input type="text" {...register('operator_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Roll No. (Link) *</label>
          <input type="text" placeholder="Search Roll No..." {...register('roll_no_id', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">QC Name *</label>
          <input type="text" {...register('qc_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </ManualInputSection>

      <ManualInputSection title="Wastage & Details">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ink Wastage (kg)</label>
          <input type="number" step="0.001" {...register('ink_wastage_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Reducer Wastage (kg)</label>
          <input type="number" step="0.001" {...register('reducer_wastage_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Test Printing Bags (nos)</label>
          <input type="number" {...register('test_printing_bags_nos')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Issue To BCS Machine No.</label>
          <input type="number" {...register('issue_to_bcs_machine_no')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Remarks</label>
          <textarea {...register('remarks')} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
        </div>
      </ManualInputSection>

      <AutoCalculatedSection>
        <AutoField label="Client Name" value="Auto from Roll" />
        <AutoField label="Fabric Desc" value="Auto from Roll" />
        <AutoField label="Printed Fabric" value={calculated.printed_fabric_m} unit="m" />
        <AutoField label="Final Print Fabric" value={calculated.final_print_fabric_m} unit="m" isHighlight />
        <AutoField label="Contractor Bill" value={calculated.contractor_bill} unit="₹" />
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

export default PrintingForm;
