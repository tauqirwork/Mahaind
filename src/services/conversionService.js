import { supabase } from '../utils/supabaseClient'; // Adjust path if needed depending on existing code
// In this setup we call our Node.js backend.
// Since auth is handled via Supabase JWT, we can fetch the session token and include it.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const fetchWithAuth = async (url, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error || 'API Error');
  }
  
  return responseData.data;
};

export const getEntries = async (stage, month, page = 1, limit = 50) => {
  let url = `/${stage}?page=${page}&limit=${limit}`;
  if (month) url += `&month=${encodeURIComponent(month)}`;
  return fetchWithAuth(url);
};

export const getSummary = async (stage, date) => {
  return fetchWithAuth(`/${stage}/summary?date=${encodeURIComponent(date)}`);
};

export const createEntry = async (stage, formData) => {
  return fetchWithAuth(`/${stage}`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });
};

export const getEntryById = async (stage, id) => {
  return fetchWithAuth(`/${stage}/${id}`);
};
