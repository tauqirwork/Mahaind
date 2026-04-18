const XLSX = require('xlsx');
const fs = require('fs');

try {
  const workbook = XLSX.readFile('../Production Calculator 4.4.xlsm', { cellFormula: true });
  const result = {};
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const sheetData = [];
    
    // Process cells and extract values, formulas
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = {c:C, r:R};
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        const cell = sheet[cellRef];
        
        if (!cell) continue; // skip empty cells
        
        if (cell.f) {
           sheetData.push({ cell: cellRef, value: cell.v, formula: cell.f });
        } else if (cell.v !== "" && cell.v !== undefined) {
           sheetData.push({ cell: cellRef, value: cell.v });
        }
      }
    }
    result[sheetName] = sheetData;
  });

  fs.writeFileSync('./formulas_dump.json', JSON.stringify(result, null, 2));
  console.log("Success! Parsed formulas into formulas_dump.json.");
} catch(err) {
  console.error("Error reading excel:", err);
}
