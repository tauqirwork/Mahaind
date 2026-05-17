import React from 'react';

export function DocumentHeader({ company, documentMeta }) {
  return (
    <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-4 doc-header">
      <div className="flex gap-4 items-start">
        {company?.logoBase64 && (
          <img 
            src={company.logoBase64} 
            alt="Logo" 
            className="w-24 h-auto" 
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company?.name}</h1>
          <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap max-w-sm">
            {company?.address}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            <strong>GSTIN:</strong> {company?.gstin}<br />
            <strong>MSME:</strong> {company?.msmeNo}
          </div>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-2">
          {documentMeta?.type?.replace('_', ' ')}
        </h2>
        <div className="text-xs text-gray-700">
          <table className="w-full text-right border-none">
            <tbody>
              <tr>
                <td className="pr-2 font-medium border-none p-1">Invoice No:</td>
                <td className="border-none p-1">{documentMeta?.documentNumber}</td>
              </tr>
              <tr>
                <td className="pr-2 font-medium border-none p-1">Date:</td>
                <td className="border-none p-1">{documentMeta?.documentDate}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
