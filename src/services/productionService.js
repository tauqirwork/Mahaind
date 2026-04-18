/**
 * Production Service — Fetches and parses Conversion Sheet data
 * Source: Monthly Conversion Google Sheet (changes every month)
 *
 * Key sheets in the conversion workbook:
 *   "Master Summary"  — Machine utilization (Tapeline, Loom, etc.)
 *   "00. Datewise Summary" — Daily production flow across all stages
 *   "B. Tapeline RM" — Raw material input at Tapeline (PP, Filler, MB, etc.)
 *   "0. Roll Down Summary" — Roll/bag output tracking
 *   "Production summary" — Total fabric & bag production
 */
import Papa from 'papaparse';
import { getActiveConversionSheetId } from './settingsService';

const buildUrl = (sheetId, sheetName) =>
  `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

const parseNum = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  const s = val.toString();
  if (s.startsWith('#')) return 0;
  const cleaned = s.replace(/[^0-9.-]+/g, '');
  return cleaned === '' ? 0 : parseFloat(cleaned);
};

/**
 * Fetch Machine Utilization from "Master Summary"
 */
export const fetchMachineUtilization = async () => {
  const sheetId = getActiveConversionSheetId();
  const url = buildUrl(sheetId, 'Master Summary ');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Master Summary: ${res.statusText}`);
  const csv = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const month = rows[0]?.[0] || '';
        // Row 1: headers [Machine Utilization, Actual, Capacity 24 hrs, Difference]
        const dataRows = rows.slice(2);
        const machines = dataRows
          .filter(r => r[0] && r[0] !== '')
          .map(r => ({
            machine: r[0],
            actual: parseNum(r[1]),
            capacity: parseNum(r[2]),
            difference: parseNum(r[3]),
            utilization: parseNum(r[2]) > 0 ? (parseNum(r[1]) / parseNum(r[2])) * 100 : 0,
          }));
        resolve({ month, machines });
      },
      error: reject,
    });
  });
};

/**
 * Fetch daily production summary from "00. Datewise Summary"
 */
export const fetchDatewiseSummary = async () => {
  const sheetId = getActiveConversionSheetId();
  const url = buildUrl(sheetId, '00. Datewise Summary');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Datewise Summary: ${res.statusText}`);
  const csv = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        // Row 0: totals, Row 1: units, Row 2: headers
        const totals = {
          tapelineRM: parseNum(rows[0]?.[2]),
          linerRM: parseNum(rows[0]?.[3]),
          rollDown_KG: parseNum(rows[0]?.[4]),
          rollDown_MTR: parseNum(rows[0]?.[5]),
          printing_KG: parseNum(rows[0]?.[6]),
          printing_MTR: parseNum(rows[0]?.[7]),
          boppLam_KG: parseNum(rows[0]?.[8]),
          boppLam_MTR: parseNum(rows[0]?.[9]),
          bcs_KG: parseNum(rows[0]?.[10]),
          balingNOS: parseNum(rows[0]?.[16]),
        };

        // Daily log starts at row 3
        const dailyLog = rows.slice(3)
          .filter(r => r[0] && !isNaN(parseNum(r[0])))
          .map(r => ({
            date: r[0],
            tapelineRM: parseNum(r[2]),
            linerRM: parseNum(r[3]),
            rollDown_KG: parseNum(r[4]),
            rollDown_MTR: parseNum(r[5]),
            printing_KG: parseNum(r[6]),
            printing_MTR: parseNum(r[7]),
            boppLam_KG: parseNum(r[8]),
            boppLam_MTR: parseNum(r[9]),
            bcs_KG: parseNum(r[10]),
            balingNOS: parseNum(r[16]),
            dispatchNOS: parseNum(r[19]),
          }));

        resolve({ totals, dailyLog });
      },
      error: reject,
    });
  });
};

/**
 * Fetch Tapeline RM consumption from "B. Tapeline RM"
 */
export const fetchTapelineRM = async () => {
  const sheetId = getActiveConversionSheetId();
  const url = buildUrl(sheetId, 'B. Tapeline RM');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Tapeline RM: ${res.statusText}`);
  const csv = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        // Row 0 is header
        const dataRows = rows.slice(1);
        const entries = dataRows
          .filter(r => r[4]) // must have client name
          .map(r => ({
            month: r[0] || '',
            date: r[1],
            clientName: r[4] || '',
            fabricDescription: r[5] || '',
            batchNo: r[6] || '',
            shift: r[7] || '',
            operator: r[8] || '',
            pp_pct: parseNum(r[9]),
            filler_pct: parseNum(r[10]),
            mb_pct: parseNum(r[11]),
            modifier_pct: parseNum(r[12]),
            ldpe_pct: parseNum(r[13]),
            uv_pct: parseNum(r[14]),
            rp_pct: parseNum(r[15]),
            pp_kg: parseNum(r[17]),
            filler_kg: parseNum(r[18]),
            mb_kg: parseNum(r[19]),
            modifier_kg: parseNum(r[20]),
            ldpe_kg: parseNum(r[21]),
            uv_kg: parseNum(r[22]),
            rp_kg: parseNum(r[23]),
            totalInput: parseNum(r[24]),
            wastage: parseNum(r[27]),
          }));

        // Aggregate RM consumption
        const rmTotals = {
          pp: 0, filler: 0, mb: 0, modifier: 0, ldpe: 0, uv: 0, rp: 0, totalInput: 0, totalWastage: 0,
        };
        entries.forEach(e => {
          rmTotals.pp += e.pp_kg;
          rmTotals.filler += e.filler_kg;
          rmTotals.mb += e.mb_kg;
          rmTotals.modifier += e.modifier_kg;
          rmTotals.ldpe += e.ldpe_kg;
          rmTotals.uv += e.uv_kg;
          rmTotals.rp += e.rp_kg;
          rmTotals.totalInput += e.totalInput;
          rmTotals.totalWastage += e.wastage;
        });

        resolve({ entries, rmTotals });
      },
      error: reject,
    });
  });
};

/**
 * Combined production data fetch
 */
export const fetchProductionData = async () => {
  try {
    const [machineUtil, datewise, tapelineRM] = await Promise.all([
      fetchMachineUtilization(),
      fetchDatewiseSummary(),
      fetchTapelineRM(),
    ]);

    // Calculate efficiency
    const efficiency = {
      tapelineUtilization: machineUtil.machines.find(m => m.machine === 'Tapeline')?.utilization || 0,
      loomUtilization: machineUtil.machines.find(m => m.machine === 'Loom')?.utilization || 0,
      totalRMInput: tapelineRM.rmTotals.totalInput,
      totalWastage: tapelineRM.rmTotals.totalWastage,
      wastagePercent: tapelineRM.rmTotals.totalInput > 0
        ? (tapelineRM.rmTotals.totalWastage / tapelineRM.rmTotals.totalInput) * 100
        : 0,
      yieldPercent: tapelineRM.rmTotals.totalInput > 0
        ? ((tapelineRM.rmTotals.totalInput - tapelineRM.rmTotals.totalWastage) / tapelineRM.rmTotals.totalInput) * 100
        : 0,
    };

    return {
      month: machineUtil.month,
      machines: machineUtil.machines,
      datewise,
      tapelineRM,
      efficiency,
    };
  } catch (error) {
    console.error('Error fetching production data:', error);
    throw error;
  }
};
