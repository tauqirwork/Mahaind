const { google } = require('googleapis');
const supabase = require('./supabaseClient');

let sheets;

const initSheetsClient = () => {
  if (sheets) return sheets;
  if (!process.env.GOOGLE_SA_JSON) {
    console.warn('GOOGLE_SA_JSON is not set. Google Sheets integration will be disabled.');
    return null;
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SA_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    return null;
  }
};

const getActiveSheetConfig = async (month_label) => {
  const { data, error } = await supabase
    .from('conversion_sheet_config')
    .select('*')
    .eq('month_label', month_label)
    .eq('is_active', true)
    .single();
    
  if (error || !data) return null;
  return data;
};

const appendRow = async (spreadsheetId, sheetName, rowData, tableName, recordId) => {
  const client = initSheetsClient();
  if (!client) return;

  try {
    const res = await client.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [rowData] }
    });

    // Determine row index from updatedRange (e.g. "SheetName!A10:Z10")
    let appendedRowIndex = null;
    if (res.data.updates && res.data.updates.updatedRange) {
      const match = res.data.updates.updatedRange.match(/[A-Z]+(\d+)/);
      if (match && match[1]) {
        appendedRowIndex = parseInt(match[1], 10);
      }
    }

    if (appendedRowIndex && tableName && recordId) {
      await supabase.from(tableName).update({ gsheet_row: appendedRowIndex }).eq('id', recordId);
    }

    await supabase.from('gsheet_sync_log').insert({
      table_name: tableName,
      record_id: recordId,
      sheet_name: sheetName,
      gsheet_row: appendedRowIndex,
      operation: 'INSERT',
      status: 'SUCCESS'
    });

    return appendedRowIndex;
  } catch (error) {
    console.error(`Failed to append row to ${sheetName}:`, error);
    await supabase.from('gsheet_sync_log').insert({
      table_name: tableName,
      record_id: recordId,
      sheet_name: sheetName,
      operation: 'INSERT',
      status: 'FAILED',
      error_msg: error.message
    });
    throw error;
  }
};

const appendTapelineRow = async (entry) => {
  const config = await getActiveSheetConfig(entry.month);
  if (!config || !config.tapeline_sheet_id) return;

  const rowData = [
    entry.month, entry.entry_date, entry.entry_time,
    entry.client_code, entry.client_name, entry.thread_color,
    entry.shift, entry.operator_name,
    entry.pp_pct, entry.filler_pct, entry.mb_pct, entry.modifier_pct,
    entry.ldpe_pct, entry.uv_pct, entry.rp_pct, 100,
    entry.pp_kg, entry.filler_kg, entry.mb_kg, entry.modifier_kg,
    entry.ldpe_kg, entry.uv_kg, entry.rp_kg, entry.total_input_kg,
    entry.starting_wastage_kg, entry.running_wastage_kg, entry.total_wastage_kg,
    entry.pp_invoice_no || '', entry.remarks, entry.tester_name,
    entry.batch_no, entry.tp_code
  ];

  return appendRow(config.tapeline_sheet_id, config.tapeline_sheet_name || 'A. Tapeline RM', rowData, 'tapeline_entries', entry.id);
};

// ... Similar functions would be implemented for Rolldown, Liner, Printing, Bopp, Bcs, Baling
const appendRolldownRow = async (entry) => { /* ... */ };
const appendLinerRow = async (entry) => { /* ... */ };
const appendPrintingRow = async (entry) => { /* ... */ };
const appendBoppRow = async (entry) => { /* ... */ };
const appendBcsRow = async (entry) => { /* ... */ };
const appendBalingRow = async (entry) => { /* ... */ };

module.exports = {
  initSheetsClient,
  getActiveSheetConfig,
  appendRow,
  appendTapelineRow,
  appendRolldownRow,
  appendLinerRow,
  appendPrintingRow,
  appendBoppRow,
  appendBcsRow,
  appendBalingRow
};
