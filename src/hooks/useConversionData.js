import { useState, useEffect, useCallback } from 'react';
import { getEntries, getSummary } from '../services/conversionService';

export const useConversionData = (stage, month, date) => {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!stage) return;
    setIsLoading(true);
    setError(null);
    try {
      const [entriesData, summaryData] = await Promise.all([
        getEntries(stage, month),
        date ? getSummary(stage, date) : Promise.resolve(null)
      ]);
      setEntries(entriesData || []);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [stage, month, date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    entries,
    summary,
    isLoading,
    error,
    refetch: fetchData
  };
};
