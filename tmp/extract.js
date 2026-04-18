const https = require('https');
const xlsx = require('xlsx');

function fetchSheet(id) {
  const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
  console.log(`Fetching ${url}...`);
  https.get(url, (res) => {
    // Follow redirect
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, processStream);
    } else {
        processStream(res);
    }
    
    function processStream(response) {
      if (response.statusCode >= 400) {
        console.error(`Error ${response.statusCode} - please check permissions for ${id}`);
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        try {
          const workbook = xlsx.read(buffer, { type: 'buffer' });
          console.log(`\n=== Workbook for ${id} ===`);
          workbook.SheetNames.forEach(sheetName => {
            console.log(`\n-- Sheet: ${sheetName} --`);
            const sheet = workbook.Sheets[sheetName];
            const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
            // Print the first 3 rows
            json.slice(0, 3).forEach(row => console.log(JSON.stringify(row)));
          });
        } catch (e) {
          console.error("Error reading workbook", e);
        }
      });
    }
  });
}

// Bag Master
fetchSheet('1q_ma0v0w-cK1qnBbR5aqU0egvCN-JBFKZjYK-4T8N_M');
// Conversion
fetchSheet('1-RmM_rMn-Q3pcDwwf5IhvtgGedEbpZrng__MPnib1BQ');
// Stock
fetchSheet('1VazQ4pvSR_hFhM_mAWnWYIBQb9xhqKimUuLpwlyiKvw');
