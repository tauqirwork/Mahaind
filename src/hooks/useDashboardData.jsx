import { useState, useEffect, createContext, useContext } from 'react';
import { fetchDashboardData } from '../services/dataService';

const DashboardDataContext = createContext(null);

export const DashboardDataProvider = ({ children }) => {
  const [data, setData] = useState({
    dispatch: [],
    receivables: [],
    clientSummary: [],
    payables: [],
    cashFlow: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Global Filters
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    client: '',
    vendor: '',
    status: '',
    searchQuery: ''
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const fetchedData = await fetchDashboardData();
      setData(fetchedData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 60 seconds
    const intervalId = setInterval(loadData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ dateRange: { start: '', end: '' }, client: '', vendor: '', status: '', searchQuery: '' });

  return (
    <DashboardDataContext.Provider value={{ data, isLoading, error, lastUpdated, filters, updateFilter, clearFilters, forceRefresh: loadData }}>
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
};
