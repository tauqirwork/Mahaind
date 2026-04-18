import React, { useState } from 'react';
import { generateTaxInvoice } from '../utils/pdfEngine';

const InvoiceGenerator = () => {
  const [formData, setFormData] = useState({
    invoiceNo: `INV-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
    dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-CA'),
    clientName: '',
    clientAddress: '',
    clientGst: '',
  });

  const [items, setItems] = useState([
    { description: '', qty: 1, rate: 0 }
  ]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: '', qty: 1, rate: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const calculateTotals = () => {
    let subTotal = 0;
    const computedItems = items.map(item => {
      const amount = item.qty * item.rate;
      subTotal += amount;
      return { ...item, amount, tax: '18%' };
    });
    
    const taxTotal = subTotal * 0.18;
    return { computedItems, subTotal, taxTotal, grandTotal: subTotal + taxTotal };
  };

  const handleExport = (e) => {
    e.preventDefault();
    const { computedItems, subTotal, taxTotal, grandTotal } = calculateTotals();
    
    const invoiceData = {
      invoiceNo: formData.invoiceNo,
      date: formData.date,
      dueDate: formData.dueDate,
      client: {
        name: formData.clientName || 'Cash Customer',
        address: formData.clientAddress,
        gst: formData.clientGst,
      },
      items: computedItems,
      subTotal,
      taxTotal,
      grandTotal
    };

    generateTaxInvoice(invoiceData);
  };

  const { subTotal, taxTotal, grandTotal } = calculateTotals();

  return (
    <>
      <section className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Invoice Generator</h2>
          <p className="text-slate-500 text-sm mt-1">Stitch unified document rendering engine for automated Tax POs & Bills.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        
        {/* Form Wizard */}
        <form onSubmit={handleExport} className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          
          <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight mb-6 border-b border-slate-100 pb-2">Client Details</h4>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Invoice / PO Number</label>
              <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" 
                value={formData.invoiceNo} onChange={e => setFormData({...formData, invoiceNo: e.target.value})} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Client Business Name</label>
              <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" 
                placeholder="Business Name..."
                value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Billing Address</label>
              <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" 
                placeholder="123 Example Street, City..."
                value={formData.clientAddress} onChange={e => setFormData({...formData, clientAddress: e.target.value})} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Date Valid</label>
              <input type="date" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" 
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">GST / VAT Number</label>
              <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" 
                placeholder="27AAXXX0000X1Z5"
                value={formData.clientGst} onChange={e => setFormData({...formData, clientGst: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
             <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Line Items</h4>
             <button type="button" onClick={addItem} className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1">
               <span className="material-symbols-outlined text-sm">add</span> Add Row
             </button>
          </div>
          
          <div className="space-y-3 mb-8">
             {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                  <input type="text" placeholder="Description/SKU" className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-primary focus:outline-none bg-white"
                     value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} required />
                  <input type="number" placeholder="Qty" className="w-20 border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-primary focus:outline-none bg-white"
                     value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))} required />
                  <input type="number" placeholder="Rate (Rs)" className="w-28 border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-primary focus:outline-none bg-white"
                     value={item.rate} onChange={e => updateItem(idx, 'rate', Number(e.target.value))} required />
                  <div className="w-24 text-right text-sm font-bold font-space text-slate-700 bg-white border border-slate-200 rounded py-1.5 px-2">
                    {(item.qty * item.rate).toLocaleString()}
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 px-1">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  )}
                </div>
             ))}
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-8 py-3 bg-primary text-white rounded font-bold text-sm shadow-md shadow-primary/30 hover:opacity-90 transition-all tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span> RENDER DOCUMENT
            </button>
          </div>
        </form>

        {/* Live Preview Panel / Details */}
        <div className="lg:col-span-1">
           <div className="bg-slate-900 rounded-xl p-6 shadow-lg text-white sticky top-24">
             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Financial Preview</h4>
             
             <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-sm">Subtotal</span>
                 <span className="font-space font-bold">Rs {subTotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-sm">Estimated Tax (18%)</span>
                 <span className="font-space font-bold text-orange-400">Rs {taxTotal.toLocaleString()}</span>
               </div>
               <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                 <span className="text-slate-200 font-bold uppercase tracking-wider text-sm">Grand Total</span>
                 <span className="font-space font-bold text-2xl text-sky-400">Rs {grandTotal.toLocaleString()}</span>
               </div>
             </div>

             <div className="bg-slate-800 rounded p-4 border border-slate-700">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-green-400">verified_user</span> PDF Engine Ready
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upon rendering, the document will automatically enforce MahaIND branded vector formats and styling strictly compliant with the localized ISO standards.
                </p>
             </div>
           </div>
        </div>
      </div>
    </>
  );
}

export default InvoiceGenerator;
