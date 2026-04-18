const Papa = require('papaparse');
const fs = require('fs');

const MAPPINGS = {
  clientSummary: {
    0: 'client_name',
    1: 'total_invoice_amount',
    2: 'total_received_amount',
    3: 'total_pending_amount',
    4: 'responsible_person'
  }
};

const mapRowArray = (rowArr, mapping) => {
  const mappedObj = {};
  for (const [indexStr, targetKey] of Object.entries(mapping)) {
    const idx = parseInt(indexStr, 10);
    const value = rowArr[idx];
    const val = value !== undefined && value !== null ? value.toString().trim() : '';
    let parsedVal = val;

    const numericKeys = [
      'quantity', 'achievement_percent', 'selling_price', 'total_amount_gst',
      'invoice_amount', 'tds_calculated', 'received_amount', 'actual_tds_deducted',
      'pending_amount', 'days_overdue', 'total_invoice_amount', 'total_received_amount',
      'total_pending_amount', 'paid_amount'
    ];
    
    if (numericKeys.includes(targetKey)) {
      const cleaned = val.replace(/[^0-9.-]+/g, "");
      parsedVal = cleaned === "" ? 0 : parseFloat(cleaned);
    }
    mappedObj[targetKey] = parsedVal;
  }
  return mappedObj;
};

const csvContent = `"","₹17,25,68,928","₹15,61,42,392","₹1,73,86,325","31 Mar 2026","","","","",""
"Client Name","","","","Responsible Person","","","","",""
"Panchganga Sugar & Power Pvt Ltd","₹4,36,77,294","₹3,96,85,671","₹39,85,437","Raju","","","","",""`;

Papa.parse(csvContent, {
  header: false,
  skipEmptyLines: true,
  complete: (results) => {
    const dataRows = results.data.slice(2);
    const mappedData = dataRows.map(rowArr => mapRowArray(rowArr, MAPPINGS.clientSummary));
    console.log(mappedData);
  }
});
