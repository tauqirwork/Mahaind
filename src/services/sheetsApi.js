const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

import { supabase } from '../utils/supabaseClient';

export async function getToken() {
  // Use official Supabase client to get the active session token
  const { data } = await supabase.auth.getSession();
  if (data?.session?.access_token) {
    return data.session.access_token;
  }
  
  // Also check a mock token for local testing
  const mockToken = localStorage.getItem('mock-auth-token');
  if (mockToken && mockToken !== 'null') return mockToken;
  
  return '';
}

export async function fetchSheetRows(tabKey) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/sheets/${tabKey}/rows`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { headers, rows }
}

export async function appendEntry(tabKey, rowArray) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/sheets/${tabKey}/append`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ rowArray })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { success, rowNumber }
}

export async function fetchUpdatedRow(tabKey, rowNumber) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/sheets/${tabKey}/row/${rowNumber}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { row }
}
