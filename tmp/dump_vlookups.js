const XLSX = require('xlsx');
const fs = require('fs');

try {
  const file = '../Production Calculator 4.4.xlsm';
  const wb = XLSX.readFile(file, { defval: "" });

  const exportData = {};

  // Extract Quotations Sheet (VLOOKUP table)
  if (wb.SheetNames.includes("Quotations")) {
     const quotesData = XLSX.utils.sheet_to_json(wb.Sheets["Quotations"], { header: 1 });
     exportData.Quotations = quotesData;
  }

  // Extract RAM Sheet (VLOOKUP table)
  if (wb.SheetNames.includes("RAM")) {
     const ramData = XLSX.utils.sheet_to_json(wb.Sheets["RAM"], { header: 1 });
     exportData.RAM = ramData;
  }

  const outPath = './vlookup_dump.json';
  fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2));
  console.log(`Successfully dumped VLOOKUP tables to ${outPath}`);

} catch(e) {
  console.error("Error:", e);
}
