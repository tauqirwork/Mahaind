// Known Google Sheet IDs (from set_sheet_config.js)
// These serve as reliable defaults when env vars or app_settings are not configured.
const DEFAULTS = {
  tapeline:   '14P-A70WDKX3yBEo6dHlJ-JNf5ED0_BUt_PTl-Ly132A',
  rolldown:   '1UPnnZkUEds0tZT4r0f6NDDu4DSV4L6txyJpOV_29gmE',
  liner:      '1fzieAQ5pZGanlZTs26K6oyd9ZEmjUqFIZB0yLsDIxG4',
  printing:   '1yAKfrU32cFEQOhqzBNeST2qB352dSwVxI3tBLXtjmrY',
  lamination: '10VxRFybwvLApMVX9n0Vu5N0xRjLoLLSiNzn_zB6vTB8',
  bcs:        '1SkGQbq-6IMXV4GbcA7StSt3hbxar3ljfNfqWMXsuxCs',
  baling:     '1EKUA_GyXkQDI3OQTPPueecrZ0knaUa_3710WQyPZxUg',
};

module.exports = {
  tapeline: {
    spreadsheetId: process.env.SHEET_ID_TAPELINE || DEFAULTS.tapeline,
    tab: 'A. Tapeline RM',
    headerRow: 2,
    dataStartRow: 3,
  },
  rolldown: {
    spreadsheetId: process.env.SHEET_ID_ROLLDOWN || DEFAULTS.rolldown,
    tab: 'A. Roll Down',
    headerRow: 2,
    dataStartRow: 3,
  },
  liner: {
    spreadsheetId: process.env.SHEET_ID_LINER || DEFAULTS.liner,
    tab: 'A. Liner RM',
    headerRow: 2,
    dataStartRow: 3,
  },
  printing: {
    spreadsheetId: process.env.SHEET_ID_PRINTING || DEFAULTS.printing,
    tab: 'A. Printing',
    headerRow: 2,
    dataStartRow: 3,
  },
  bopp: {
    spreadsheetId: process.env.SHEET_ID_BOPP || DEFAULTS.lamination,
    tab: 'A. BOPP/Lamination',
    headerRow: 2,
    dataStartRow: 3,
  },
  bcs: {
    spreadsheetId: process.env.SHEET_ID_BCS || DEFAULTS.bcs,
    tab: 'A. BCS (Bag Conversion Section)',
    headerRow: 2,
    dataStartRow: 3,
  },
  baling: {
    spreadsheetId: process.env.SHEET_ID_BALING || DEFAULTS.baling,
    tab: 'B. Baling',
    headerRow: 2,
    dataStartRow: 3,
  },
  loom_qc: {
    spreadsheetId: process.env.SHEET_ID_ROLLDOWN || DEFAULTS.rolldown,
    tab: 'B. Loom QC Report',
    headerRow: 2,
    dataStartRow: 3,
  },
  liner_qc: {
    spreadsheetId: process.env.SHEET_ID_LINER || DEFAULTS.liner,
    tab: 'B.Liner QC Report',
    headerRow: 2,
    dataStartRow: 3,
  },
  printing_qc: {
    spreadsheetId: process.env.SHEET_ID_PRINTING || DEFAULTS.printing,
    tab: 'B. Printing QC Report',
    headerRow: 2,
    dataStartRow: 3,
  },
  printing_ink_qc: {
    spreadsheetId: process.env.SHEET_ID_PRINTING || DEFAULTS.printing,
    tab: 'B.1 Printing Roll Down QC Report',
    headerRow: 2,
    dataStartRow: 3,
  },
  bopp_qc: {
    spreadsheetId: process.env.SHEET_ID_BOPP || DEFAULTS.lamination,
    tab: 'B. BOPP Lamination QC Report',
    headerRow: 2,
    dataStartRow: 3,
  },
  bcs_qc: {
    spreadsheetId: process.env.SHEET_ID_BCS || DEFAULTS.bcs,
    tab: 'B. BCS (Bag Conversion Section) QC Report',
    headerRow: 1,
    dataStartRow: 2,
  },
  manual_stitch_qc: {
    spreadsheetId: process.env.SHEET_ID_BALING || DEFAULTS.baling,
    tab: 'C. Manual Stitching QC Report',
    headerRow: 1,
    dataStartRow: 2,
  },
};

