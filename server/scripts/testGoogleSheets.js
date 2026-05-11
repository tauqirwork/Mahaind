require('dotenv').config({ path: '../.env' });
const { google } = require('googleapis');

async function testSheets() {
  try {
    const credentials = require('C:\\Users\\tauqi\\Downloads\\sheetsmahaind-e8e69d6a8a76.json');
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    const bagMasterId = '1q_ma0v0w-cK1qnBbR5aqU0egvCN-JBFKZjYK-4T8N_M';
    const stockReportId = '1VazQ4pvSR_hFhM_mAWnWYIBQb9xhqKimUuLpwlyiKvw';
    
    console.log(`Testing connection to Bag Master... (${bagMasterId})`);
    const bmRes = await sheets.spreadsheets.values.get({ spreadsheetId: bagMasterId, range: 'Final Master!A1:Z2' });
    console.log(`Success! Headers:\n`, bmRes.data.values);
    
    console.log(`Testing connection to Stock Report... (${stockReportId})`);
    const srRes = await sheets.spreadsheets.get({ spreadsheetId: stockReportId });
    console.log(`Success! Stock Report Title: ${srRes.data.properties.title}`);
    console.log(`Tabs found: ${srRes.data.sheets.map(s => s.properties.title).join(', ')}\n`);
    
  } catch (error) {
    console.error('Error testing sheets:', error.message);
  }
}

testSheets();
