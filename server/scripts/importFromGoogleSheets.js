require('dotenv').config({ path: '../.env' });
const { google } = require('googleapis');
const supabase = require('../services/supabaseClient');

// Expected columns in Google Sheet for Tapeline
// 0: Month, 1: Date, 2: Time, 3: Client Code, 4: Client Name, 5: Thread Color, 6: Shift
// 7: Operator, 8: PP%, 9: Filler%, 10: MB%, 11: Mod%, 12: LDPE%, 13: UV%, 14: RP%, 15: Total%
// 16: PP kg, 17: Filler kg, 18: MB kg, 19: Mod kg, 20: LDPE kg, 21: UV kg, 22: RP kg, 23: Total Input kg
// 24: Start Waste, 25: Run Waste, 26: Total Waste, 27: PP Inv, 28: Remarks, 29: Tester, 30: Batch No, 31: TP Code

async function importTapeline(sheets, spreadsheetId, sheetName, monthLabel) {
  console.log(`Fetching Tapeline data from ${sheetName}...`);
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A3:AF`, // Skip first 2 header rows
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in Tapeline.');
      return;
    }

    console.log(`Found ${rows.length} rows. Importing to Supabase...`);

    const entries = rows.map((row, index) => {
      // Basic mapping, skip empty rows
      if (!row[1] || !row[6]) return null; // Date and Shift are minimum required
      
      return {
        month: monthLabel,
        entry_date: row[1],
        entry_time: row[2] || null,
        client_code: row[3] || null,
        thread_color: row[5] || null,
        shift: row[6],
        operator_name: row[7] || null,
        
        pp_pct: parseFloat(row[8]) || 0,
        filler_pct: parseFloat(row[9]) || 0,
        mb_pct: parseFloat(row[10]) || 0,
        modifier_pct: parseFloat(row[11]) || 0,
        ldpe_pct: parseFloat(row[12]) || 0,
        uv_pct: parseFloat(row[13]) || 0,
        rp_pct: parseFloat(row[14]) || 0,
        
        pp_kg: parseFloat(row[16]) || 0,
        filler_kg: parseFloat(row[17]) || 0,
        mb_kg: parseFloat(row[18]) || 0,
        modifier_kg: parseFloat(row[19]) || 0,
        ldpe_kg: parseFloat(row[20]) || 0,
        uv_kg: parseFloat(row[21]) || 0,
        rp_kg: parseFloat(row[22]) || 0,
        total_input_kg: parseFloat(row[23]) || 0,
        
        starting_wastage_kg: parseFloat(row[24]) || 0,
        running_wastage_kg: parseFloat(row[25]) || 0,
        total_wastage_kg: parseFloat(row[26]) || 0,
        
        remarks: row[28] || null,
        tester_name: row[29] || null,
        batch_no: row[30] || null,
        tp_code: row[31] || null,
        
        gsheet_row: index + 3 // A3 starts at index 0, so row 3
      };
    }).filter(row => row !== null);

    if (entries.length > 0) {
      const { data, error } = await supabase.from('tapeline_entries').insert(entries);
      if (error) {
        console.error('Error inserting Tapeline entries:', error.message);
      } else {
        console.log(`Successfully imported ${entries.length} Tapeline entries!`);
      }
    }

  } catch (err) {
    console.error('Error importing tapeline:', err.message);
  }
}

async function runImport() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node importFromGoogleSheets.js <SPREADSHEET_ID> <MONTH_LABEL>');
    console.log('Example: node importFromGoogleSheets.js 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms "Apr\'26"');
    process.exit(1);
  }

  const spreadsheetId = args[0];
  const monthLabel = args[1];

  if (!process.env.GOOGLE_SA_JSON) {
    console.error('ERROR: GOOGLE_SA_JSON is not set in .env file!');
    process.exit(1);
  }

  const credentials = JSON.parse(process.env.GOOGLE_SA_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`Starting import from Spreadsheet: ${spreadsheetId} for Month: ${monthLabel}`);
  
  await importTapeline(sheets, spreadsheetId, 'A. Tapeline RM', monthLabel);
  
  console.log('Import process complete!');
}

runImport();
