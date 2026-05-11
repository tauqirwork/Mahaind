import React, { useState } from 'react';
import { FORM_FIELDS } from '../../../config/formFields';
import { useAppendEntry } from '../../../hooks/useAppendEntry';

export default function LinerForm({ onSubmitSuccess }) {
  const fields = FORM_FIELDS.liner;
  const { submit, loading, error } = useAppendEntry('liner', onSubmitSuccess);

  const [formData, setFormData] = useState(() => {
    const defaults = {};
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - offset);
    defaults.date = localTime.toISOString().split('T')[0];
    defaults.time = localTime.toISOString().split('T')[1].slice(0, 5);
    return defaults;
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const missing = fields.filter(f => f.required && !formData[f.name]);
    if (missing.length > 0) {
      alert(`Please fill: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    submit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
      
      {fields.map(field => (
        <div key={field.name}>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          
          {field.type === 'select' ? (
            <select
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              value={formData[field.name] || ''}
              onChange={e => handleChange(field.name, e.target.value)}
            >
              <option value="">Select...</option>
              {field.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              value={formData[field.name] || ''}
              onChange={e => handleChange(field.name, e.target.value)}
              rows={2}
            />
          ) : (
            <input
              type={field.type}
              step={field.type === 'number' ? 'any' : undefined}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              value={formData[field.name] || ''}
              onChange={e => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white py-3 rounded font-bold text-sm uppercase tracking-wider hover:bg-sky-500 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
        >
          {loading && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
          {loading ? 'Submitting...' : 'Submit Entry'}
        </button>
      </div>
    </form>
  );
}
