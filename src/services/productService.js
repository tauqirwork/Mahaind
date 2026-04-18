/**
 * Product Service — Fetches and parses Bag Master Data
 * Source: Bag Master Google Sheet
 *
 * Key sheets:
 *   "Bag Master Data pool" / "Final Master" — full bag definitions with formulation
 *   "Bag wise Summary" — profitability summary per bag
 *   "Individual Bagwise" — per-bag individual costing
 *
 * Unique bag ID = Client Name + Bag Specs/Description/Type
 */
import Papa from 'papaparse';
import { getSettings } from './settingsService';

const buildUrl = (sheetId, sheetName) =>
  `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

const parseNum = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  const s = val.toString();
  if (s === '#REF!' || s === '#N/A' || s === '#VALUE!') return 0;
  const cleaned = s.replace(/[^0-9.-]+/g, '');
  return cleaned === '' ? 0 : parseFloat(cleaned);
};

const pct = (val) => {
  const n = parseNum(val);
  return n > 1 ? n / 100 : n; // normalize: 0.65 stays, 65 becomes 0.65
};

/**
 * Fetch data from the "Bag Master Data pool" sheet
 */
export const fetchBagMasterPool = async () => {
  const { bagMasterSheetId } = getSettings();
  const url = buildUrl(bagMasterSheetId, 'Bag Master Data pool');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Bag Master Data pool: ${res.statusText}`);
  const csv = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        // Row 0 is header
        const dataRows = results.data.slice(1);
        const bags = dataRows
          .filter(r => r[2] && r[3]) // must have Client Name and Bag Specs
          .map(r => ({
            location: r[0] || '',
            billingParty: r[1] || '',
            clientName: r[2] || '',
            bagSpecs: r[3] || '',
            uniqueId: `${(r[2] || '').trim()} — ${(r[3] || '').trim()}`,
            fabricCode: r[4] || '',
            fabricDescription: r[5] || '',
            unit: r[6] || '',
            width: parseNum(r[7]),
            length: parseNum(r[8]),
            cutWidth: parseNum(r[9]),
            cutLength: parseNum(r[10]),
            denier: parseNum(r[11]),
            tapeWidth: parseNum(r[12]),
            mesh: parseNum(r[13]),
            fabricGSM: parseNum(r[14]),
            meterWeight: parseNum(r[15]),
            fabricWeight: parseNum(r[16]),
            totalBagWeight: parseNum(r[17]),
            // Formulation percentages
            formulation: {
              pp: pct(r[19]),
              filler: pct(r[20]),
              mb: pct(r[21]),
              modifier: pct(r[22]),
              ld: pct(r[23]),
              uv: pct(r[24]),
              rp: pct(r[25]),
            },
          }));
        resolve(bags);
      },
      error: reject,
    });
  });
};

/**
 * Fetch the "Bag wise Summary" sheet — per-bag profitability
 */
export const fetchBagSummary = async () => {
  const { bagMasterSheetId } = getSettings();
  const url = buildUrl(bagMasterSheetId, 'Bag wise Summary');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Bag wise Summary: ${res.statusText}`);
  const csv = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        // Row 0 is totals, Row 1 is header
        const dataRows = results.data.slice(2);
        const bags = dataRows
          .filter(r => r[0] && r[1])
          .map(r => ({
            clientName: r[0] || '',
            bagDescription: r[1] || '',
            uniqueId: `${(r[0] || '').trim()} — ${(r[1] || '').trim()}`,
            poRate: parseNum(r[2]),
            sellingPriceGST: parseNum(r[3]),
            productionCost: parseNum(r[4]),
            profitAmount: parseNum(r[5]),
            profitPercent: parseNum(r[6]),
            saleQty: parseNum(r[7]),
          }));
        resolve(bags);
      },
      error: reject,
    });
  });
};

/**
 * Fetch the "Individual Bagwise" sheet — per-bag individual P&L
 */
export const fetchIndividualBagwise = async () => {
  const { bagMasterSheetId } = getSettings();
  const url = buildUrl(bagMasterSheetId, 'Individual Bagwise');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Individual Bagwise: ${res.statusText}`);
  const csv = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const dataRows = results.data.slice(2);
        const bags = dataRows
          .filter(r => r[0] && r[1])
          .map(r => ({
            clientName: r[0] || '',
            bagDescription: r[1] || '',
            uniqueId: `${(r[0] || '').trim()} — ${(r[1] || '').trim()}`,
            poRate: parseNum(r[2]),
            sellingPriceGST: parseNum(r[3]),
            productionCost: parseNum(r[4]),
            profitAmount: parseNum(r[5]),
            profitPercent: parseNum(r[6]),
            saleQty: parseNum(r[7]),
          }));
        resolve(bags);
      },
      error: reject,
    });
  });
};

/**
 * Combined product catalog fetch — merges master pool with summary
 */
export const fetchProductCatalog = async () => {
  try {
    const [masterPool, bagSummary] = await Promise.all([
      fetchBagMasterPool(),
      fetchBagSummary(),
    ]);

    // Create a lookup from summary by uniqueId
    const summaryMap = {};
    bagSummary.forEach(s => {
      summaryMap[s.uniqueId] = s;
    });

    // Merge formulation from masterPool with profitability from summary
    const catalog = masterPool.map(bag => {
      const summary = summaryMap[bag.uniqueId] || {};
      return {
        ...bag,
        poRate: summary.poRate || 0,
        sellingPriceGST: summary.sellingPriceGST || 0,
        productionCost: summary.productionCost || 0,
        profitAmount: summary.profitAmount || 0,
        profitPercent: summary.profitPercent || 0,
        saleQty: summary.saleQty || 0,
        isProfitable: (summary.profitPercent || 0) > 0,
      };
    });

    // Deduplicate by uniqueId
    const seen = new Set();
    const deduplicated = catalog.filter(b => {
      if (seen.has(b.uniqueId)) return false;
      seen.add(b.uniqueId);
      return true;
    });

    // Overall stats
    const totalProducts = deduplicated.length;
    const profitableCount = deduplicated.filter(b => b.isProfitable).length;
    const avgProfit = deduplicated.length > 0
      ? deduplicated.reduce((sum, b) => sum + (b.profitPercent || 0), 0) / deduplicated.length
      : 0;

    return {
      catalog: deduplicated,
      stats: { totalProducts, profitableCount, avgProfit },
    };
  } catch (error) {
    console.error('Error fetching product catalog:', error);
    throw error;
  }
};
