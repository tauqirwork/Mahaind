import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { calculateTapelineFields } from '../../../utils/conversionCalculations';
import ManualInputSection from '../sections/ManualInputSection';
import AutoCalculatedSection, { AutoField } from '../sections/AutoCalculatedSection';

const TapelineForm = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      shift: 'A',
      pp_pct: 0, filler_pct: 0, mb_pct: 0, modifier_pct: 0, ldpe_pct: 0, uv_pct: 0, rp_pct: 0,
      total_input_kg: 0,
      starting_wastage_kg: 0, running_wastage_kg: 0,
      no_production: false
    }
  });

  const values = watch();
  const noProduction = values.no_production;

  const calculated = useMemo(() => {
    return calculateTapelineFields(values);
  }, [
    values.total_input_kg, values.pp_pct, values.filler_pct, values.mb_pct,
    values.modifier_pct, values.ldpe_pct, values.uv_pct, values.rp_pct,
    values.starting_wastage_kg, values.running_wastage_kg
  ]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      <div className="bg-white p-4 rounded shadow border border-gray-100 flex items-center justify-between">
        <label className="flex items-center gap-2 font-medium text-red-600">
          <input type="checkbox" {...register('no_production')} className="w-5 h-5 rounded text-red-600 focus:ring-red-500" />
          Mark as No Production for this shift
        </label>
        
        {!noProduction && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Total % Check:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              calculated.isTotalPctValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {calculated.total_pct}%
            </span>
          </div>
        )}
      </div>

      {!noProduction && (
        <>
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
              <label className="block text-sm font-medium text-gray-700">Operator Name *</label>
              <input type="text" {...register('operator_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Code *</label>
              <input type="text" {...register('client_code', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Thread Color / Description</label>
              <input type="text" {...register('thread_color')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </ManualInputSection>

          <ManualInputSection title="Material Composition & Input">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Input (kg) *</label>
              <input type="number" step="0.001" {...register('total_input_kg', { required: true, min: 0.001 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PP % *</label>
              <input type="number" step="0.01" {...register('pp_pct', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Filler %</label>
              <input type="number" step="0.01" {...register('filler_pct')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Masterbatch (MB) %</label>
              <input type="number" step="0.01" {...register('mb_pct')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LDPE %</label>
              <input type="number" step="0.01" {...register('ldpe_pct')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">UV %</label>
              <input type="number" step="0.01" {...register('uv_pct')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </ManualInputSection>

          <ManualInputSection title="Wastage & Other">
            <div>
              <label className="block text-sm font-medium text-gray-700">Starting Wastage (kg)</label>
              <input type="number" step="0.001" {...register('starting_wastage_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Running Wastage (kg)</label>
              <input type="number" step="0.001" {...register('running_wastage_kg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tester Name *</label>
              <input type="text" {...register('tester_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea {...register('remarks')} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
            </div>
          </ManualInputSection>

          <AutoCalculatedSection>
            <AutoField label="PP kg" value={calculated.pp_kg} unit="kg" />
            <AutoField label="Filler kg" value={calculated.filler_kg} unit="kg" />
            <AutoField label="MB kg" value={calculated.mb_kg} unit="kg" />
            <AutoField label="LDPE kg" value={calculated.ldpe_kg} unit="kg" />
            <AutoField label="UV kg" value={calculated.uv_kg} unit="kg" />
            <AutoField 
              label="Total Wastage" 
              value={calculated.total_wastage_kg} 
              unit="kg" 
              isHighlight 
              highlightColor="red" 
            />
            <AutoField label="Batch No." value="Auto-generated" />
            <AutoField label="TP Code" value="Auto-generated" />
          </AutoCalculatedSection>
        </>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting || (!noProduction && !calculated.isTotalPctValid)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
};

export default TapelineForm;
