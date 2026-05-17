import React from 'react';

export function TaxSummary({ totals }) {
  if (!totals) return null;
  return (
    <div className="flex justify-end mb-4">
      <div className="w-1/2">
        <table className="w-full text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1 px-2 font-medium text-gray-700">Taxable Amount</td>
              <td className="py-1 px-2 text-right font-bold">₹ {totals.taxableValue?.toFixed(2)}</td>
            </tr>
            {totals.cgst > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600">Add: CGST @ 9%</td>
                <td className="py-1 px-2 text-right">₹ {totals.cgst?.toFixed(2)}</td>
              </tr>
            )}
            {totals.sgst > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600">Add: SGST @ 9%</td>
                <td className="py-1 px-2 text-right">₹ {totals.sgst?.toFixed(2)}</td>
              </tr>
            )}
            {totals.igst > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600">Add: IGST @ 18%</td>
                <td className="py-1 px-2 text-right">₹ {totals.igst?.toFixed(2)}</td>
              </tr>
            )}
            {totals.roundOff !== 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600">Round Off</td>
                <td className="py-1 px-2 text-right">₹ {totals.roundOff?.toFixed(2)}</td>
              </tr>
            )}
            <tr className="bg-gray-100 text-gray-900 border border-gray-300">
              <td className="py-2 px-2 font-bold text-sm uppercase">Total Invoice Amount</td>
              <td className="py-2 px-2 text-right font-bold text-sm">₹ {totals.grandTotal?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
