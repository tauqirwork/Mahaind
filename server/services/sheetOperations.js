const sheets = require('./googleSheets');

exports.appendRow = async (spreadsheetId, tabName, rowArray, dataStartRow = 3) => {

  // STEP 1: Get all values in the sheet to find true last data row
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'`,
    valueRenderOption: 'FORMATTED_VALUE'
  });

  const allRows = existing.data.values || [];
  let lastDataRow = allRows.length; // 1-indexed (e.g. 67)
  
  // Safety fallback if sheet is completely empty
  if (lastDataRow < dataStartRow) lastDataRow = dataStartRow;

  const newRowNumber = lastDataRow + 1; // new row to write into

  console.log(`Last data row: ${lastDataRow}, Writing to row: ${newRowNumber}`);

  // Safety check — never copy from row 1 or 2 (headers/instructions)
  if (lastDataRow < 3) {
    throw new Error('Not enough existing data rows to copy formulas from. Add at least one data row manually in the sheet first.');
  }

  // STEP 2: Get sheetId for batchUpdate
  const sheetId = await getSheetId(spreadsheetId, tabName);
  console.log(`Sheet ID for "${tabName}": ${sheetId}`);

  // STEP 3: Copy ONLY formulas from last data row into new row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        copyPaste: {
          source: {
            sheetId: sheetId,
            startRowIndex: dataStartRow - 1,  // Always copy from master row
            endRowIndex: dataStartRow,
            startColumnIndex: 0,
            endColumnIndex: 50
          },
          destination: {
            sheetId: sheetId,
            startRowIndex: newRowNumber - 1,  // 0-indexed new row
            endRowIndex: newRowNumber,
            startColumnIndex: 0,
            endColumnIndex: 50
          },
          pasteType: 'PASTE_FORMULA',
          pasteOrientation: 'NORMAL'
        }
      }]
    }
  });

  console.log(`Formulas copied from row ${lastDataRow} to row ${newRowNumber}`);

  // STEP 4: Write manual values ON TOP of the copied formulas
  // Build a sparse update — only write to cells that have manual values
  // This avoids overwriting formula cells with empty strings
  const sparseData = [];
  rowArray.forEach((value, index) => {
    if (value !== '' && value !== null && value !== undefined) {
      const colLetter = columnIndexToLetter(index);
      sparseData.push({
        range: `'${tabName}'!${colLetter}${newRowNumber}`,
        values: [[value]]
      });
    }
  });

  if (sparseData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: sparseData
      }
    });
  }

  console.log(`Manual values written to row ${newRowNumber}`);
  return newRowNumber;
};


// Convert column index (0-based) to letter (A, B, ... Z, AA, AB...)
function columnIndexToLetter(index) {
  let letter = '';
  let num = index;
  while (num >= 0) {
    letter = String.fromCharCode((num % 26) + 65) + letter;
    num = Math.floor(num / 26) - 1;
  }
  return letter;
}

// Cache sheet tab IDs
const sheetIdCache = {};
async function getSheetId(spreadsheetId, tabName) {
  const cacheKey = `${spreadsheetId}::${tabName}`;
  if (sheetIdCache[cacheKey]) return sheetIdCache[cacheKey];
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = res.data.sheets.find(s => s.properties.title === tabName);
  if (!sheet) throw new Error(`Tab "${tabName}" not found in spreadsheet`);
  sheetIdCache[cacheKey] = sheet.properties.sheetId;
  return sheetIdCache[cacheKey];
}

exports.getHeaders = async (spreadsheetId, tabName, headerRow) => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!${headerRow}:${headerRow}`,
  });
  return res.data.values && res.data.values.length > 0 ? res.data.values[0] : [];
};

exports.getRows = async (spreadsheetId, tabName, dataStartRow) => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!${dataStartRow}:1000`,
  });
  return res.data.values || [];
};

exports.getRow = async (spreadsheetId, tabName, rowNum) => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!${rowNum}:${rowNum}`,
    valueRenderOption: 'FORMATTED_VALUE'
  });
  return res.data.values && res.data.values.length > 0 ? res.data.values[0] : [];
};