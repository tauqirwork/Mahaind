import React from 'react';

export function DocumentFooter({ bankDetails, terms, companyName }) {
  return (
    <div className="grid grid-cols-2 gap-8 border border-gray-300 mt-8 page-break-inside-avoid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', border: '1px solid #d1d5db', marginTop: '2rem' }}>
      <div className="p-3 border-r border-gray-300" style={{ padding: '12px', borderRight: '1px solid #d1d5db' }}>
        <h4 className="font-bold text-xs uppercase mb-2 bg-gray-100 p-1" style={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', backgroundColor: '#f3f4f6', padding: '4px' }}>Bank Details</h4>
        <div className="text-xs space-y-1" style={{ fontSize: '0.75rem' }}>
          <p style={{ margin: '4px 0' }}><span className="text-gray-600" style={{ color: '#4b5563' }}>Bank Name:</span> <strong>{bankDetails?.bank}</strong></p>
          <p style={{ margin: '4px 0' }}><span className="text-gray-600" style={{ color: '#4b5563' }}>A/C No:</span> <strong>{bankDetails?.account}</strong></p>
          <p style={{ margin: '4px 0' }}><span className="text-gray-600" style={{ color: '#4b5563' }}>IFSC Code:</span> <strong>{bankDetails?.ifsc}</strong></p>
          <p style={{ margin: '4px 0' }}><span className="text-gray-600" style={{ color: '#4b5563' }}>Branch:</span> {bankDetails?.branch}</p>
        </div>
        
        {terms && (
          <div className="mt-4" style={{ marginTop: '1rem' }}>
            <h4 className="font-bold text-xs uppercase mb-1 border-b border-gray-200 pb-1" style={{ fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>Terms & Conditions</h4>
            <p className="text-[10px] text-gray-600 whitespace-pre-wrap" style={{ fontSize: '10px', color: '#4b5563', whiteSpace: 'pre-wrap', margin: 0 }}>{terms}</p>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col justify-between" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '120px' }}>
        <div className="text-right" style={{ textAlign: 'right' }}>
          <p className="text-xs text-gray-600">For,</p>
          <p className="font-bold text-sm text-gray-900">{companyName}</p>
        </div>
        
        <div className="text-right mt-16" style={{ textAlign: 'right', marginTop: '4rem' }}>
          <p className="text-xs font-medium text-gray-800 border-t border-gray-300 inline-block pt-1" style={{ borderTop: '1px solid #d1d5db', paddingTop: '4px', display: 'inline-block' }}>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
