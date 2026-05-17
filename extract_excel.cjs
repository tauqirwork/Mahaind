const XLSX = require('xlsx');

const workbook = XLSX.readFile('c:/Users/tauqi/Downloads/Telegram Desktop/KO/Salary - Apr 26.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Columns:', Object.keys(data[0] || {}));
console.log('First 5 rows:', data.slice(0, 5));
