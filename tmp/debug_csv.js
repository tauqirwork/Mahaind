const Papa = require('papaparse');
const fs = require('fs');

const SHEET_ID = '173Bfzte_dqB1Y9gAgsyUfnplyxGDubEfvo856gLDS7w';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Dispatch Report`;

fetch(BASE_URL)
  .then(res => res.text())
  .then(csv => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Headers:", results.meta.fields);
        console.log("First Row:", results.data[0] || null);
      }
    });
  });
