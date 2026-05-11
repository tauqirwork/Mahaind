import { FORM_FIELDS } from '../config/formFields';

export function buildRowArray(tabKey, formData, totalCols = 40) {
  const fields = FORM_FIELDS[tabKey];
  const row = new Array(totalCols).fill('');

  fields.forEach(field => {
    if (field.colIndex !== null && formData[field.name] !== undefined) {
      let value = formData[field.name];
      if (field.type === 'checkbox') return; // handled separately
      row[field.colIndex] = value ?? '';
    }
  });

  // Special case: No Production checkbox for Tapeline
  if (tabKey === 'tapeline' && formData.no_production) {
    const emptyRow = new Array(totalCols).fill('');
    emptyRow[1] = formData.date;
    emptyRow[3] = 'NO PRODUCTION';
    return emptyRow;
  }

  return row;
}
