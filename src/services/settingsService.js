/**
 * Settings Service — persists configuration to localStorage
 * Handles monthly conversion sheet URL management.
 */

const STORAGE_KEY = 'mahaind_settings';

const DEFAULT_SETTINGS = {
  conversionSheetId: '1-RmM_rMn-Q3pcDwwf5IhvtgGedEbpZrng__MPnib1BQ',
  stockReportSheetId: '1VazQ4pvSR_hFhM_mAWnWYIBQb9xhqKimUuLpwlyiKvw',
  bagMasterSheetId: '1q_ma0v0w-cK1qnBbR5aqU0egvCN-JBFKZjYK-4T8N_M',
  conversionSheetUrls: [
    {
      month: 'Mar 2026',
      sheetId: '1-RmM_rMn-Q3pcDwwf5IhvtgGedEbpZrng__MPnib1BQ',
      active: true,
    }
  ],
};

export const getSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to parse settings from localStorage', e);
  }
  return { ...DEFAULT_SETTINGS };
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const addConversionSheet = (month, sheetId) => {
  const settings = getSettings();
  // Deactivate all existing
  settings.conversionSheetUrls = settings.conversionSheetUrls.map(s => ({ ...s, active: false }));
  settings.conversionSheetUrls.push({ month, sheetId, active: true });
  settings.conversionSheetId = sheetId;
  saveSettings(settings);
  return settings;
};

export const getActiveConversionSheetId = () => {
  const settings = getSettings();
  const active = settings.conversionSheetUrls.find(s => s.active);
  return active ? active.sheetId : settings.conversionSheetId;
};

/**
 * Extracts the Google Sheet ID from a full URL or bare ID
 */
export const extractSheetId = (input) => {
  if (!input) return null;
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // Assume it's already a bare ID
  if (/^[a-zA-Z0-9_-]+$/.test(input.trim())) return input.trim();
  return null;
};
