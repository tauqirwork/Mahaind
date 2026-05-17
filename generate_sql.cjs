const XLSX = require('xlsx');

const workbook = XLSX.readFile('c:/Users/tauqi/Downloads/Telegram Desktop/KO/Salary - Apr 26.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const queries = [];
queries.push(`-- Execute this in your Supabase SQL Editor`);
queries.push(`DELETE FROM employees;`);
queries.push(`-- Reset ID sequence if necessary (optional)`);
queries.push(`-- ALTER SEQUENCE employees_id_seq RESTART WITH 1;`);
queries.push(`\nINSERT INTO employees (employee_id, name, base_salary, status) VALUES `);

const values = data.map(row => {
    const empId = row['Emp. Id'] ? `'${row['Emp. Id'].replace(/'/g, "''")}'` : 'NULL';
    const name = row['Employee Name'] ? `'${row['Employee Name'].replace(/'/g, "''")}'` : 'NULL';
    const salary = row['Salary'] ? parseFloat(row['Salary']) : 0;
    
    // Sometimes Meal Allowance or Arrears are in the Excel. 
    // We only insert base employee info into 'employees' table.
    return `(${empId}, ${name}, ${salary}, 'active')`;
});

queries.push(values.join(',\n') + ';');

const fs = require('fs');
fs.writeFileSync('c:/Users/tauqi/Mahaind/employee_seed.sql', queries.join('\n'));
console.log('SQL generated to c:/Users/tauqi/Mahaind/employee_seed.sql');
