const sheets = require('./googleSheets');

exports.appendRow = async (spreadsheetId, tabName, rowData) => {
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${tabName}'!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [rowData] }
  });

  const updatedRange = res.data.updates.updatedRange;
  const match = updatedRange.match(/(\d+):?\w*(\d+)?$/);
  return parseInt(match[1]); // row number
};

exports.getRows = async (spreadsheetId, tabName, startRow) => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A${startRow}:ZZ`,
    valueRenderOption: 'FORMATTED_VALUE'
  });
  return res.data.values || [];
};

exports.getRow = async (spreadsheetId, tabName, rowNum) => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A${rowNum}:ZZ${rowNum}`,
    valueRenderOption: 'FORMATTED_VALUE'
  });
  return res.data.values?.[0] || [];
};

exports.getHeaders = async (spreadsheetId, tabName, headerRow) => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A${headerRow}:ZZ${headerRow}`,
    valueRenderOption: 'FORMATTED_VALUE'
  });
  return res.data.values?.[0] || [];
};
