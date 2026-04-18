const https = require('https');
const xlsx = require('xlsx');
const fs = require('fs');

const dump = {};

function fetchSheet(name, id) {
  return new Promise((resolve) => {
    const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https.get(res.headers.location, processStream);
      } else {
          processStream(res);
      }
      
      function processStream(response) {
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          try {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            dump[name] = {};
            workbook.SheetNames.forEach(sheetName => {
              const sheet = workbook.Sheets[sheetName];
              const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
              dump[name][sheetName] = json.slice(0, 3); // top 3 rows
            });
          } catch (e) {
            console.error(e);
          }
          resolve();
        });
      }
    });
  });
}

(async () => {
  await fetchSheet('BagMaster', '1q_ma0v0w-cK1qnBbR5aqU0egvCN-JBFKZjYK-4T8N_M');
  await fetchSheet('Conversion', '1-RmM_rMn-Q3pcDwwf5IhvtgGedEbpZrng__MPnib1BQ');
  await fetchSheet('Stock', '1VazQ4pvSR_hFhM_mAWnWYIBQb9xhqKimUuLpwlyiKvw');
  fs.writeFileSync('dump.json', JSON.stringify(dump, null, 2));
  console.log('Saved to dump.json');
})();
