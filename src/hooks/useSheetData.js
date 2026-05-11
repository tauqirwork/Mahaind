import { useState, useEffect } from 'react';
import { fetchSheetRows } from '../services/sheetsApi';

export function useSheetData(tabKey) {
  const [data, setData] = useState({ headers: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSheetRows(tabKey);
      // Reverse the rows so newest is at the top (optional, but requested in UX)
      // Or we can just keep sheet order. The user said "keep Sheet order — Sheet order recommended"
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabKey) {
      loadData();
    }
  }, [tabKey]);

  return { data, loading, error, reload: loadData, setData };
}
