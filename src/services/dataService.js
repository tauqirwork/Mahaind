import Papa from 'papaparse';

const SHEET_ID = '173Bfzte_dqB1Y9gAgsyUfnplyxGDubEfvo856gLDS7w';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=`;

const MAPPINGS = {
  dispatch: {
    1: 'date',
    2: 'billing_party',
    3: 'client_name',
    4: 'bag_description',
    5: 'fabric_description',
    6: 'quantity',
    7: 'unit',
    8: 'week',
    10: 'selling_price',
    11: 'total_amount_gst',
    12: 'location',
    13: 'transporter',
    14: 'invoice_no',
    15: 'po_number',
  },
  receivables: {
    1: 'client_name',
    4: 'invoice_no',
    5: 'invoice_date',
    7: 'credit_term_days',
    8: 'due_date',
    12: 'invoice_amount',
    13: 'tds_calculated',
    14: 'received_amount',
    15: 'actual_tds_deducted',
    16: 'pending_amount',
    17: 'responsible_person',
    19: 'days_overdue',
  },
  clientSummary: {
    0: 'client_name',
    1: 'total_invoice_amount',
    2: 'total_received_amount',
    3: 'total_pending_amount',
    4: 'responsible_person',
  },
  payables: {
    0: 'type',
    1: 'vendor_name',
    6: 'pending_amount',
  },
  cashFlow: {
    0: 'transaction_date',
    1: 'party_name',
    2: 'transaction_id',
    3: 'paid_amount',
    4: 'received_amount',
  }
};

const mapRowArray = (rowArr, mapping) => {
  const mappedObj = {};
  for (const [indexStr, targetKey] of Object.entries(mapping)) {
    const idx = parseInt(indexStr, 10);
    const value = rowArr[idx];
    const val = value !== undefined && value !== null ? value.toString().trim() : '';
    let parsedVal = val;

    const numericKeys = [
      'quantity', 'achievement_percent', 'selling_price', 'total_amount_gst',
      'invoice_amount', 'tds_calculated', 'received_amount', 'actual_tds_deducted',
      'pending_amount', 'days_overdue', 'total_invoice_amount', 'total_received_amount',
      'total_pending_amount', 'paid_amount'
    ];

    if (numericKeys.includes(targetKey)) {
      const cleaned = val.replace(/[^0-9.-]+/g, "");
      parsedVal = cleaned === "" ? 0 : parseFloat(cleaned);
    }
    mappedObj[targetKey] = parsedVal;
  }
  return mappedObj;
};

const fetchSheet = async (sheetName, mapping) => {
  try {
    const response = await fetch(`${BASE_URL}${encodeURIComponent(sheetName)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${sheetName}: ${response.statusText}`);
    }
    const csvContent = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          // Skip first 2 rows (headers)
          const dataRows = results.data.slice(2);
          const mappedData = dataRows.map(rowArr => mapRowArray(rowArr, mapping));
          resolve(mappedData);
        },
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    throw error;
  }
};

export const fetchDashboardData = async () => {
  try {
    const [dispatchRaw, receivablesRaw, clientSummaryRaw, payablesRaw, cashFlowRaw] = await Promise.all([
      fetchSheet('Dispatch Report', MAPPINGS.dispatch),
      fetchSheet('Final Receivables Report', MAPPINGS.receivables),
      fetchSheet('Sheet47', MAPPINGS.clientSummary),
      fetchSheet('Sheet49', MAPPINGS.payables),
      fetchSheet('In-Out', MAPPINGS.cashFlow)
    ]);

    // Apply data validation: skip row if important fields are empty
    return {
      dispatch: dispatchRaw.filter(r => r.invoice_no && r.client_name),
      receivables: receivablesRaw.filter(r => r.invoice_no && r.client_name),
      clientSummary: clientSummaryRaw.filter(r => r.client_name),
      payables: payablesRaw.filter(r => r.vendor_name),
      cashFlow: cashFlowRaw.filter(r => r.transaction_id)
    };
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    throw error;
  }
};
