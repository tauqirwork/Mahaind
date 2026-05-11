module.exports = {
  tapeline: {
    spreadsheetId: process.env.SHEET_ID_TAPELINE || '',
    tab: 'A. Tapeline RM',
    headerRow: 2,
    dataStartRow: 3,
  },
  rolldown: {
    spreadsheetId: process.env.SHEET_ID_ROLLDOWN || '',
    tab: 'A. Roll Down',
    headerRow: 2,
    dataStartRow: 3,
  },
  liner: {
    spreadsheetId: process.env.SHEET_ID_LINER || '',
    tab: 'A. Liner RM',
    headerRow: 2,
    dataStartRow: 3,
  },
  printing: {
    spreadsheetId: process.env.SHEET_ID_PRINTING || '',
    tab: 'A. Printing',
    headerRow: 2,
    dataStartRow: 3,
  },
  bopp: {
    spreadsheetId: process.env.SHEET_ID_BOPP || '',
    tab: 'A. BOPPLamination',
    headerRow: 2,
    dataStartRow: 3,
  },
  bcs: {
    spreadsheetId: process.env.SHEET_ID_BCS || '',
    tab: 'A. BCS (Bag Conversion Section)',
    headerRow: 2,
    dataStartRow: 3,
  },
  baling: {
    spreadsheetId: process.env.SHEET_ID_BALING || '',
    tab: 'B. Baling',
    headerRow: 2,
    dataStartRow: 3,
  },
};
