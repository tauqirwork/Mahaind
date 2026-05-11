import React, { useState } from 'react';
import { FORM_FIELDS } from '../../../config/formFields';

export default function BaseForm({ tabKey, onSubmit, loading, error }) {
  const fields = FORM_FIELDS[tabKey];
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
    onSubmit(formData);
  };

  if (!fields) return <div>No fields configured for {tabKey}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {fields.map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === 'select' ? (
            <select
              className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              value={formData[field.name] || ''}
              onChange={e => handleChange(field.name, e.target.value)}
            >
              <option value="">Select...</option>
              {field.options && field.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              value={formData[field.name] || ''}
              onChange={e => handleChange(field.name, e.target.value)}
              rows={2}
            />
          ) : (
            <input
              type={field.type}
              className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              value={formData[field.name] || ''}
              onChange={e => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
      {error && (
        <div className="text-red-500 text-sm font-medium mt-2 p-2 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-colors mt-4"
      >
        {loading ? 'Submitting...' : 'Submit Entry'}
      </button>
    </form>
  );
}
