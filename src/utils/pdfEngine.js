import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Generic styled export for data grids
export const generateDataReport = (title, columns, data) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(14, 165, 233); // Sky Blue
  doc.text(title, 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text("MahaIND Overseas Pvt Ltd.", 14, 33);

  // Table
  const tableColumn = columns.map(col => col.header);
  const tableRows = data.map(row => {
    return columns.map(col => {
      // Handle simple string accessors
      if (typeof col.accessor === 'string') return row[col.accessor] || '';
      return '';
    });
  });

  doc.autoTable({
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 }
  });

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`);
};

// Stitch Cash Flow aesthetic invoice matching Refined Tax format
export const generateTaxInvoice = (invoiceData) => {
  const doc = new jsPDF();

  // Primary colors
  const primaryBrand = [234, 88, 12]; // Orange-600
  const secondaryBrand = [14, 165, 233]; // Sky-500

  // Top Accent Bar
  doc.setFillColor(...primaryBrand);
  doc.rect(0, 0, 210, 5, 'F');

  // Header -> Logo / Company Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...secondaryBrand);
  doc.text("MahaIND", 14, 25);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Overseas Pvt Ltd.", 14, 30);

  // Invoice Title
  doc.setFontSize(30);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("INVOICE", 140, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`No: ${invoiceData.invoiceNo || 'INV-001'}`, 140, 32);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${invoiceData.date || new Date().toLocaleDateString()}`, 140, 38);
  doc.text(`Due Date: ${invoiceData.dueDate || new Date().toLocaleDateString()}`, 140, 44);

  // Billing Sections
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(14, 52, 196, 52); // Divider

  // From
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Bill From:", 14, 62);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("MahaIND Overseas Pvt Ltd.\n123 Industrial Area, Phase II\nMaharashtra, INDIA 400001\nGST: 27AABCM1234E1Z5", 14, 68);

  // To
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Bill To:", 110, 62);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  let billToText = "";
  if (invoiceData.client) billToText += `${invoiceData.client.name}\n${invoiceData.client.address || ''}\n${invoiceData.client.gst ? 'GST: ' + invoiceData.client.gst : ''}`;
  else billToText = "Valued Customer\nClient Address";
  doc.text(billToText, 110, 68);

  // Items Table
  const tableCols = [['Item Description', 'Qty', 'Rate', 'Tax (%)', 'Amount']];
  const tableRows = (invoiceData.items || []).map(item => [
    item.description || 'N/A',
    item.qty || 0,
    `Rs ${item.rate || 0}`,
    item.tax || '18%',
    `Rs ${item.amount || 0}`
  ]);

  doc.autoTable({
    startY: 95,
    head: tableCols,
    body: tableRows,
    theme: 'plain',
    headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', lineWidth: 0.1, lineColor: [226, 232, 240] },
    bodyStyles: { textColor: [71, 85, 105], borderBottom: '1px solid #e2e8f0' },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 5 }
  });

  // Calculate Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  
  const subTotal = invoiceData.subTotal || 0;
  const taxTotal = invoiceData.taxTotal || 0;
  const grandTotal = invoiceData.grandTotal || (subTotal + taxTotal);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", 140, finalY);
  doc.text(`Rs ${subTotal.toLocaleString()}`, 196, finalY, { align: 'right' });
  
  doc.text("Taxes:", 140, finalY + 8);
  doc.text(`Rs ${taxTotal.toLocaleString()}`, 196, finalY + 8, { align: 'right' });

  // Grand Total Box
  doc.setFillColor(248, 250, 252);
  doc.rect(135, finalY + 14, 65, 12, 'F');
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Total Due:", 140, finalY + 22);
  doc.setTextColor(...primaryBrand);
  doc.text(`Rs ${grandTotal.toLocaleString()}`, 196, finalY + 22, { align: 'right' });

  // Footer / Notes
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Bank Details:", 14, finalY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("HDFC Bank Ltd.\nAcct: 50200012345678\nIFSC: HDFC0001234", 14, finalY + 6);

  // Save
  doc.save(`TAX_INVOICE_${invoiceData.invoiceNo || 'DRAFT'}.pdf`);
};
