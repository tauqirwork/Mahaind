import { useState } from 'react';
import { appendEntry, fetchUpdatedRow } from '../services/sheetsApi';
import { buildRowArray } from '../utils/rowBuilders';

export function useAppendEntry(tabKey, onSuccess) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const rowArray = buildRowArray(tabKey, formData);
      const { rowNumber } = await appendEntry(tabKey, rowArray);

      // Wait for Sheets to compute formulas
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { row } = await fetchUpdatedRow(tabKey, rowNumber);
      
      if (onSuccess) onSuccess(row, rowNumber);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
