import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import ManualInputSection from '../sections/ManualInputSection';
import AutoCalculatedSection, { AutoField } from '../sections/AutoCalculatedSection';

const LinerForm = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      shift: 'A',
      machine_no: '',
      lldpe_kg: 0,
      filler_kandui_kg: 0,
      kandui_mouser_kg: 0,
      rp_kg: 0,
      mb_04_kg: 0,
      ldpe_kg: 0,
      tpt_kg: 0,
      liner_wastage_kg: 0,
      is_bis: true
    }
  });

  const values = watch();
  
  const calculated = useMemo(() => {
    const lldpe_kg = parseFloat(values.lldpe_kg) || 0;
    const filler_kandui_kg = parseFloat(values.filler_kandui_kg) || 0;
    const kandui_mouser_kg = parseFloat(values.kandui_mouser_kg) || 0;
    const rp_kg = parseFloat(values.rp_kg) || 0;
    const mb_04_kg = parseFloat(values.mb_04_kg) || 0;
    const ldpe_kg = parseFloat(values.ldpe_kg) || 0;
    const tpt_kg = parseFloat(values.tpt_kg) || 0;

    const total_rm_kg = lldpe_kg + filler_kandui_kg + kandui_mouser_kg + rp_kg + mb_04_kg + ldpe_kg + tpt_kg;

    // Dummy formula for liner cut weight for preview
    const meter_weight_g = parseFloat(values.meter_weight_g) || 0;
    const liner_cut_weight_g = meter_weight_g * 1.5; // Mock calculation based on width/length

    return {
      total_rm_kg: parseFloat(total_rm_kg.toFixed(3)),
      liner_cut_weight_g: parseFloat(liner_cut_weight_g.toFixed(2))
    };
  }, [
    values.lldpe_kg, values.filler_kandui_kg, values.kandui_mouser_kg,
    values.rp_kg, values.mb_04_kg, values.ldpe_kg, values.tpt_kg, values.meter_weight_g
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
          <label className="block text-sm font-medium text-gray-700">Machine No. *</label>
          <select {...register('machine_no', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Code *</label>
          <input type="text" {...register('client_code', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Operator Name *</label>
          <input type="text" {...register('operator_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div className="flex items-center mt-6">
          <label className="flex items-center gap-2 font-medium text-gray-700">
            <input type="checkbox" {...register('is_bis')} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
            BIS / NON-BIS
          </label>
        </div>
      </ManualInputSection>

      <ManualInputSection title="Liner Specifications">
        <div>
          <label className="block text-sm font-medium text-gray-700">Meter Weight (g) *</label>
          <input type="number" step="0.01" {...register('meter_weight_g', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Width (inch) *</label>
          <input type="number" step="0.01" {...register('width_inch', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Length (inch) *</label>
          <input type="number" step="0.01" {...register('length_inch', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </ManualInputSection>

      <ManualInputSection title="Material Input & Wastage">
        <div>
          <label className="block text-sm font-medium text-gray-700">LLDPE (kg)</label>
          <input type="number" step="0.001" {...register('lldpe_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Filler Kandui (kg)</label>
          <input type="number" step="0.001" {...register('filler_kandui_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Kandui Mouser (kg)</label>
          <input type="number" step="0.001" {...register('kandui_mouser_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">RP (kg)</label>
          <input type="number" step="0.001" {...register('rp_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">MB-04 (kg)</label>
          <input type="number" step="0.001" {...register('mb_04_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">LDPE (kg)</label>
          <input type="number" step="0.001" {...register('ldpe_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">TPT (kg)</label>
          <input type="number" step="0.001" {...register('tpt_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Liner Wastage (kg)</label>
          <input type="number" step="0.001" {...register('liner_wastage_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tester Name *</label>
          <input type="text" {...register('tester_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </ManualInputSection>

      <AutoCalculatedSection>
        <AutoField label="Batch No." value="Auto-generated" />
        <AutoField label="Client Name" value="Auto-filled from Code" />
        <AutoField label="Total RM" value={calculated.total_rm_kg} unit="kg" isHighlight />
        <AutoField label="Liner Cut Weight" value={calculated.liner_cut_weight_g} unit="g" />
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

export default LinerForm;
