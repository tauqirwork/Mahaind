const XLSX = require('xlsx');
const fs = require('fs');

try {
  const workbook = XLSX.readFile('../Production Calculator 4.4.xlsm');
  const result = { sheets: {} };
  
  workbook.SheetNames.forEach(sheetName => {
    // Convert just top 20 rows
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false, defval: null }).slice(0, 20);
    result.sheets[sheetName] = data;
  });

  fs.writeFileSync('./excel_dump.json', JSON.stringify(result, null, 2));
  console.log("Success! Parsed excel sheets info.");
} catch(err) {
  console.error("Error reading excel:", err);
}
