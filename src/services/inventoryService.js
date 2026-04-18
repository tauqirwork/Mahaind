/**
 * Inventory Service — Fetches and parses Stock Report data
 * Source: Stock Report Google Sheet
 * 
 * Stock Report structure (per dated sheet like "31 Mar 2026"):
 *   Row 0: [null, null, ..., totalAmount]
 *   Row 1: [Date, Department, Type, Subtype, Storage location, Raw Material, Quantity, Sub-Quantity, Unit, Unit Price with GST, Total Amount]
 *   Row 2+: data rows
 * 
 * Stock Summary sheet:
 *   Row 0: [null, totalAmount, null, null, totalAmount]
 *   Row 1: [Department, Amount, null, Material Type, Amount]
 *   Row 2+: data rows
 */
import Papa from 'papaparse';
import { getSettings } from './settingsService';

const buildUrl = (sheetId, sheetName) =>
  `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

const parseNum = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  const cleaned = val.toString().replace(/[^0-9.-]+/g, '');
  return cleaned === '' ? 0 : parseFloat(cleaned);
};

/**
 * Fetch Stock Summary — department-wise and material-type-wise totals
 */
export const fetchStockSummary = async () => {
  const { stockReportSheetId } = getSettings();
  const url = buildUrl(stockReportSheetId, 'Stock Summary');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Stock Summary: ${res.statusText}`);
  const csv = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const totalAmount = parseNum(rows[0]?.[1]);

        const departments = [];
        const materialTypes = [];

        for (let i = 2; i < rows.length; i++) {
          const row = rows[i];
          if (row[0]) {
            departments.push({
              name: row[0],
              amount: parseNum(row[1]),
            });
          }
          if (row[3]) {
            materialTypes.push({
              name: row[3],
              amount: parseNum(row[4]),
            });
          }
        }

        resolve({ totalAmount, departments, materialTypes });
      },
      error: reject,
    });
  });
};

/**
 * Fetch detailed stock for a specific date-sheet (e.g. "31 Mar 2026")
 */
export const fetchStockDetail = async (sheetName = '31 Mar 2026') => {
  const { stockReportSheetId } = getSettings();
  const url = buildUrl(stockReportSheetId, sheetName);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${sheetName}: ${res.statusText}`);
  const csv = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const totalStockValue = parseNum(rows[0]?.[10]);
        const dataRows = rows.slice(2);

        const items = dataRows
          .filter(r => r[5]) // must have a Raw Material name
          .map(r => ({
            date: r[0],
            department: r[1] || '',
            type: r[2] || '',
            subtype: r[3] || '',
            storageLocation: r[4] || '',
            rawMaterial: r[5] || '',
            quantity: parseNum(r[6]),
            subQuantity: r[7] || '',
            unit: r[8] || '',
            unitPrice: parseNum(r[9]),
            totalAmount: parseNum(r[10]),
          }));

        // Aggregate by raw material
        const aggregated = {};
        items.forEach(item => {
          const key = item.rawMaterial.toUpperCase().trim();
          if (!aggregated[key]) {
            aggregated[key] = {
              name: item.rawMaterial,
              totalQuantity: 0,
              totalValue: 0,
              unit: item.unit,
              avgPrice: 0,
              department: item.department,
              entries: [],
            };
          }
          aggregated[key].totalQuantity += item.quantity;
          aggregated[key].totalValue += item.totalAmount;
          aggregated[key].entries.push(item);
        });

        // Calculate avg price
        Object.values(aggregated).forEach(agg => {
          agg.avgPrice = agg.totalQuantity > 0 ? agg.totalValue / agg.totalQuantity : 0;
        });

        resolve({
          totalStockValue,
          items,
          aggregated: Object.values(aggregated).sort((a, b) => b.totalValue - a.totalValue),
        });
      },
      error: reject,
    });
  });
};

/**
 * Combined inventory data fetch
 */
export const fetchInventoryData = async () => {
  try {
    const [summary, detail] = await Promise.all([
      fetchStockSummary(),
      fetchStockDetail('31 Mar 2026'),
    ]);

    // Generate alerts
    const alerts = [];
    detail.aggregated.forEach(rm => {
      if (rm.totalQuantity < 500 && rm.totalQuantity > 0) {
        alerts.push({
          type: 'low_stock',
          severity: 'warning',
          material: rm.name,
          quantity: rm.totalQuantity,
          unit: rm.unit,
          message: `Low stock: ${rm.name} — only ${rm.totalQuantity.toLocaleString()} ${rm.unit} remaining`,
        });
      }
    });

    return { summary, detail, alerts };
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
};
