exports.generateTPCode = (entry, invoiceNo, sequenceNo) => {
  const dateObj = new Date(entry.entry_date);
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const dateStr = `${dd}${mm}${yyyy}`;
  
  const ratios = [
    entry.pp_pct || 0,
    entry.filler_pct || 0,
    entry.mb_pct || 0,
    entry.modifier_pct || 0,
    entry.ldpe_pct || 0,
    entry.uv_pct || 0,
    entry.rp_pct || 0
  ].join('/');
  
  // Format: InvoiceNo-TP-PP%/Filler%/MB%/Modifier%/LDPE%/UV%/RP%-Client-DDMMYYYY-Shift-SequenceNo
  return `${invoiceNo}-TP-${ratios}/${entry.client_name || entry.client_code}-${dateStr}-${entry.shift}-${sequenceNo}`;
};

exports.generateBatchNo = (entry, invoiceNo, sequenceNo) => {
  return this.generateTPCode(entry, invoiceNo, sequenceNo); // For tapeline, batch no is often the same or similar to TP code
};
