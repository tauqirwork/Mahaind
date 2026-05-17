import React from 'react';
import { DocumentPreview } from '../components/documents/previewer/DocumentPreview';
import { TaxInvoice } from '../components/documents/templates/TaxInvoice';

// A dummy schema payload based on the technical specification
const dummyDocumentData = {
  documentType: 'TAX_INVOICE',
  documentNumber: 'MOPL/25/26-27',
  documentDate: '2026-04-15',
  status: 'DRAFT',
  company: {
    name: 'Mahaind Overseas Pvt Ltd',
    gstin: '27AAQCM7594N1ZA',
    msmeNo: 'UDYAM-MH-26-0458799',
    address: 'Bhairat Patil Industrial Park Gat No 537 & 538, Badhalwadi (Navlakh Umbre), Taluka: Maval, Dist: Pune 410507',
    bankDetails: {
      bank: 'HDFC BANK LTD',
      account: '50200067891234',
      ifsc: 'HDFC0000123',
      branch: 'PUNE MAIN'
    }
  },
  buyer: {
    name: 'SARV POLYPACK INDIA PRIVATE LIMITED',
    gstin: '27ABLCS3117R1ZO',
    address: 'Shop No.8, C-9, Shantideep Society, Tulsibagwale Colony, Sahakarnagar 2, Parvati, Pune 411009',
    state: 'Maharashtra',
    stateCode: '27'
  },
  lineItems: [
    {
      description: 'PP Woven Sack Bags',
      subDescription: 'PP BAG 50 KG REFINED BROWN',
      hsnCode: '39232990',
      quantity: 8892,
      unit: 'Nos',
      rate: 33.60,
      taxableAmount: 298771.20
    }
  ],
  totals: {
    taxableValue: 298771.20,
    cgst: 26889.41,
    sgst: 26889.41,
    igst: 0,
    roundOff: -0.02,
    grandTotal: 352550.00
  },
  config: {
    watermark: 'DRAFT',
    termsAndConditions: '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is delayed.\n3. Subject to Pune Jurisdiction.'
  }
};

const DocumentPreviewer = () => {
  return (
    <div className="pt-6">
      <div className="mb-6 animate-fade-in shrink-0">
        <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Invoice Generator</h2>
        <p className="text-slate-500 text-sm mt-1">Template-based PDF generation engine with Puppeteer backend.</p>
      </div>

      <DocumentPreview 
        documentData={dummyDocumentData} 
        TemplateComponent={TaxInvoice} 
      />
    </div>
  );
};

export default DocumentPreviewer;
