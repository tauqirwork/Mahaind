import React, { useState, useEffect } from 'react';
import { useBuyersProducts, usePDFExport } from '../../../hooks/usePDFExport';
import { DocumentLayout } from '../engine/DocumentLayout';

const COMPANY_STATIC = {
  name: 'Mahaind Overseas Pvt Ltd',
  address: 'Bhairat Patil Industrial Park, Gat No. 537 & 538, Badhalwadi (Navlakh Umbre), Taluka: Maval, Dist: Pune – 410507, Maharashtra',
  gstin: '27AAQCM7594N1ZA',
  msmeNo: 'UDYAM-MH-26-0458799',
  phone: '', 
  email: '', 
  website: '',
  tagline: 'Manufacturing & Trading',
  bankDetails: { bank: '', account: '', ifsc: '', branch: '' },
  // Logo is merged server-side, but we can leave a placeholder
  logoBase64: '' 
};

export default function TaxInvoiceForm() {
  const { buyers, products, loading: dataLoading } = useBuyersProducts();
  const { exportPDF, isExporting } = usePDFExport();
  
  const [docMeta, setDocMeta] = useState({
    documentNumber: `INV-${Date.now().toString().slice(-6)}`,
    documentDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    gstType: 'same_state', // 'same_state' | 'inter_state'
    buyerOrderNo: '',
    refNoDate: '',
    dispatchDocNo: '',
    dispatchThrough: '',
    destination: '',
    motorVehicleNo: ''
  });

  const [selectedBuyer, setSelectedBuyer] = useState(null);
  
  const [lineItems, setLineItems] = useState([]);
  
  const [config, setConfig] = useState({
    termsAndConditions: '1. All disputes are subject to Pune Jurisdiction.\n2. E. & O.E.',
    notes: '',
    watermarkText: ''
  });

  // Calculate totals
  const totals = lineItems.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const discount = parseFloat(item.discount) || 0;
    
    const amountBeforeDiscount = qty * rate;
    const discountAmt = amountBeforeDiscount * (discount / 100);
    const taxableAmount = amountBeforeDiscount - discountAmt;
    
    const gstRate = parseFloat(item.gstRate) || 0;
    
    let cgst = 0, sgst = 0, igst = 0;
    if (docMeta.gstType === 'same_state') {
      cgst = taxableAmount * ((gstRate / 2) / 100);
      sgst = taxableAmount * ((gstRate / 2) / 100);
    } else {
      igst = taxableAmount * (gstRate / 100);
    }
    
    acc.taxableValue += taxableAmount;
    acc.totalCGST += cgst;
    acc.totalSGST += sgst;
    acc.totalIGST += igst;
    return acc;
  }, { taxableValue: 0, totalCGST: 0, totalSGST: 0, totalIGST: 0 });

  const rawTotal = totals.taxableValue + totals.totalCGST + totals.totalSGST + totals.totalIGST;
  totals.roundOff = Math.round(rawTotal) - rawTotal;
  totals.grandTotal = Math.round(rawTotal);

  // Computed document data for preview
  const documentData = {
    documentType: 'TAX_INVOICE',
    documentNumber: docMeta.documentNumber,
    documentDate: docMeta.documentDate,
    company: COMPANY_STATIC,
    buyer: selectedBuyer || {},
    dispatch: docMeta,
    lineItems,
    totals,
    config
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { 
      productId: '', description: '', subDescription: '', hsnCode: '', 
      unit: 'Nos', gstRate: 18, quantity: 1, rate: 0, discount: 0 
    }]);
  };

  const handleRemoveLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index, productStr) => {
    if (!productStr) return;
    const product = JSON.parse(productStr);
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      description: product.name,
      subDescription: product.description || '',
      hsnCode: product.hsnCode || '',
      unit: product.unit || 'Nos',
      gstRate: parseFloat(product.gstRate) || 18,
      rate: parseFloat(product.defaultRate) || 0
    };
    setLineItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  useEffect(() => {
    // Fetch company config from backend to get the logo base64 for preview
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3001/api') + '/pdf/config')
      .then(res => res.json())
      .then(data => {
         if (data.logoBase64) {
             COMPANY_STATIC.logoBase64 = data.logoBase64;
             // Force re-render just to apply logo to preview
             setDocMeta(prev => ({...prev}));
         }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-100 p-4 gap-4 overflow-hidden">
      
      {/* LEFT: FORM PANEL */}
      <div className="w-1/2 bg-white rounded-lg shadow flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">Create Tax Invoice</h2>
          <button 
            onClick={() => exportPDF('pdf-document-root', documentData)}
            disabled={!selectedBuyer || isExporting}
            className="px-4 py-2 bg-sky-600 text-white rounded font-medium disabled:opacity-50"
          >
            {isExporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Doc Info */}
          <section className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Invoice No</label>
              <input type="text" className="w-full border rounded p-2 text-sm" value={docMeta.documentNumber} onChange={e => setDocMeta({...docMeta, documentNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
              <input type="date" className="w-full border rounded p-2 text-sm" value={docMeta.documentDate} onChange={e => setDocMeta({...docMeta, documentDate: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">GST Type</label>
               <select className="w-full border rounded p-2 text-sm" value={docMeta.gstType} onChange={e => setDocMeta({...docMeta, gstType: e.target.value})}>
                 <option value="same_state">Same State (CGST + SGST)</option>
                 <option value="inter_state">Inter State (IGST)</option>
               </select>
            </div>
            <div className="hidden">
               <label className="block text-xs font-medium text-slate-500 mb-1">Watermark</label>
               <input type="text" placeholder="e.g. DRAFT" className="w-full border rounded p-2 text-sm" value={config.watermarkText} onChange={e => setConfig({...config, watermarkText: e.target.value})} />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border">
            <h3 className="col-span-2 text-sm font-bold text-slate-700 border-b pb-2">Dispatch & References</h3>
            <div>
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Buyer's Order No.</label>
               <input type="text" className="w-full border rounded p-1.5 text-sm" value={docMeta.buyerOrderNo} onChange={e => setDocMeta({...docMeta, buyerOrderNo: e.target.value})} />
            </div>
            <div>
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ref No. & Date</label>
               <input type="text" className="w-full border rounded p-1.5 text-sm" value={docMeta.refNoDate} onChange={e => setDocMeta({...docMeta, refNoDate: e.target.value})} />
            </div>
            <div>
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Dispatch Doc No.</label>
               <input type="text" className="w-full border rounded p-1.5 text-sm" value={docMeta.dispatchDocNo} onChange={e => setDocMeta({...docMeta, dispatchDocNo: e.target.value})} />
            </div>
            <div>
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Dispatch Through</label>
               <input type="text" className="w-full border rounded p-1.5 text-sm" value={docMeta.dispatchThrough} onChange={e => setDocMeta({...docMeta, dispatchThrough: e.target.value})} />
            </div>
            <div>
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Destination</label>
               <input type="text" className="w-full border rounded p-1.5 text-sm" value={docMeta.destination} onChange={e => setDocMeta({...docMeta, destination: e.target.value})} />
            </div>
            <div>
               <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Motor Vehicle No.</label>
               <input type="text" className="w-full border rounded p-1.5 text-sm" value={docMeta.motorVehicleNo} onChange={e => setDocMeta({...docMeta, motorVehicleNo: e.target.value})} />
            </div>
          </section>

          {/* Bill To */}
          <section className="bg-slate-50 p-4 rounded border">
             <label className="block text-sm font-bold text-slate-700 mb-3">Bill To (Buyer)</label>
             <select 
                className="w-full border rounded p-2 text-sm mb-3"
                onChange={e => setSelectedBuyer(e.target.value ? JSON.parse(e.target.value) : null)}
             >
                <option value="">-- Select Buyer --</option>
                {!dataLoading && buyers.map(b => (
                   <option key={b.gstin} value={JSON.stringify(b)}>{b.name} ({b.state})</option>
                ))}
             </select>
             {selectedBuyer && (
               <div className="text-xs text-slate-600 bg-white p-3 rounded border">
                 <strong>{selectedBuyer.name}</strong><br />
                 {selectedBuyer.address}, {selectedBuyer.state}<br />
                 GSTIN: {selectedBuyer.gstin} | Ph: {selectedBuyer.phone}
               </div>
             )}
          </section>

          {/* Line Items */}
          <section>
             <div className="flex justify-between items-center mb-3">
               <label className="block text-sm font-bold text-slate-700">Line Items</label>
               <button onClick={handleAddLineItem} className="text-xs text-sky-600 font-bold px-2 py-1 bg-sky-50 rounded">
                 + Add Item
               </button>
             </div>
             
             <div className="space-y-4">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="border rounded p-3 bg-slate-50 relative">
                     <button onClick={() => handleRemoveLineItem(idx)} className="absolute top-2 right-2 text-red-500 font-bold">✕</button>
                     <select 
                        className="w-[calc(100%-30px)] border rounded p-2 text-sm mb-2"
                        onChange={e => handleProductSelect(idx, e.target.value)}
                     >
                        <option value="">-- Select Product --</option>
                        {!dataLoading && products.map((p, i) => (
                           <option key={i} value={JSON.stringify(p)}>{p.name}</option>
                        ))}
                     </select>
                     
                     <div className="grid grid-cols-12 gap-2 mb-2">
                        <div className="col-span-8">
                           <input type="text" placeholder="Description" className="w-full border rounded p-1 text-xs" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} />
                        </div>
                        <div className="col-span-4">
                           <input type="text" placeholder="HSN" className="w-full border rounded p-1 text-xs" value={item.hsnCode} onChange={e => handleItemChange(idx, 'hsnCode', e.target.value)} />
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-4 gap-2">
                        <div>
                           <label className="text-[10px] text-slate-500">Qty</label>
                           <input type="number" className="w-full border rounded p-1 text-xs" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} />
                        </div>
                        <div>
                           <label className="text-[10px] text-slate-500">Rate</label>
                           <input type="number" className="w-full border rounded p-1 text-xs" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} />
                        </div>
                        <div>
                           <label className="text-[10px] text-slate-500">GST %</label>
                           <select className="w-full border rounded p-1 text-xs" value={item.gstRate} onChange={e => handleItemChange(idx, 'gstRate', e.target.value)}>
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-[10px] text-slate-500">Amount</label>
                           <div className="w-full bg-slate-100 p-1 text-xs text-right border rounded font-mono">
                             {((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
                {lineItems.length === 0 && <div className="text-xs text-slate-400 italic text-center p-4">No items added</div>}
             </div>
          </section>

          {/* Totals Summary */}
          <section className="bg-sky-50 p-4 rounded border grid grid-cols-2 text-sm">
             <div className="space-y-1">
                <div className="flex justify-between"><span className="text-slate-500">Taxable Value:</span><span className="font-mono">{totals.taxableValue.toFixed(2)}</span></div>
                {docMeta.gstType === 'same_state' && (
                  <>
                     <div className="flex justify-between"><span className="text-slate-500">CGST:</span><span className="font-mono">{totals.totalCGST.toFixed(2)}</span></div>
                     <div className="flex justify-between"><span className="text-slate-500">SGST:</span><span className="font-mono">{totals.totalSGST.toFixed(2)}</span></div>
                  </>
                )}
                {docMeta.gstType === 'inter_state' && (
                   <div className="flex justify-between"><span className="text-slate-500">IGST:</span><span className="font-mono">{totals.totalIGST.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-slate-500">Round Off:</span><span className="font-mono">{totals.roundOff.toFixed(2)}</span></div>
             </div>
             <div className="flex flex-col justify-end items-end">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Grand Total</span>
                <span className="text-2xl font-bold text-sky-900 font-mono">₹{totals.grandTotal.toLocaleString()}</span>
             </div>
          </section>

          {/* Terms & Notes */}
          <section>
             <label className="block text-sm font-bold text-slate-700 mb-1">Terms & Conditions</label>
             <textarea className="w-full border rounded p-2 text-xs h-20" value={config.termsAndConditions} onChange={e => setConfig({...config, termsAndConditions: e.target.value})}></textarea>
          </section>
        </div>
      </div>
      
      {/* RIGHT: PREVIEW PANEL */}
      <div className="w-1/2 bg-slate-300 rounded-lg shadow overflow-auto flex items-start justify-center p-4">
         <div 
            className="origin-top bg-white shadow-xl transition-all" 
            style={{ 
               transform: 'scale(0.7)', 
               width: '210mm', // A4 width
               minHeight: '297mm', // A4 height
            }}
         >
            {/* The DocumentLayout handles rendering exactly how the PDF will look */}
            <DocumentLayout data={documentData}>
               <table className="w-full text-xs mt-4">
                  <thead>
                     <tr>
                        <th>Sr.</th>
                        <th>Description</th>
                        <th>HSN</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                     </tr>
                  </thead>
                  <tbody>
                     {lineItems.map((item, i) => {
                        const qty = parseFloat(item.quantity) || 0;
                        const rate = parseFloat(item.rate) || 0;
                        const amt = qty * rate;
                        return (
                           <tr key={i}>
                              <td className="text-center">{i + 1}</td>
                              <td>{item.description}</td>
                              <td>{item.hsnCode}</td>
                              <td className="text-right">{qty} {item.unit}</td>
                              <td className="text-right">{rate.toFixed(2)}</td>
                              <td className="text-right">{amt.toFixed(2)}</td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </DocumentLayout>
         </div>
      </div>
      
    </div>
  );
}
