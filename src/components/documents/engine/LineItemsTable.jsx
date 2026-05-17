import React from 'react';

export function LineItemsTable({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-100 text-gray-800">
            <th className="py-2 text-center w-10">Sl No.</th>
            <th className="py-2 px-2 text-left">Description of Goods</th>
            <th className="py-2 px-2 text-center w-20">HSN/SAC</th>
            <th className="py-2 px-2 text-right w-20">Quantity</th>
            <th className="py-2 px-2 text-center w-12">Unit</th>
            <th className="py-2 px-2 text-right w-20">Rate</th>
            <th className="py-2 px-2 text-right w-24">Amount</th>
          </tr>
        </thead>
        <tbody className="align-top border-b border-gray-300">
          {items.map((item, i) => (
            <tr key={i} className="border-x border-gray-300">
              <td className="py-2 px-1 text-center border-r border-gray-300">{i + 1}</td>
              <td className="py-2 px-2 border-r border-gray-300">
                <div className="font-bold">{item.description}</div>
                {item.subDescription && <div className="text-gray-600 mt-1">{item.subDescription}</div>}
              </td>
              <td className="py-2 px-2 text-center border-r border-gray-300">{item.hsnCode || item.hsn}</td>
              <td className="py-2 px-2 text-right border-r border-gray-300 font-medium">
                {item.quantity || item.qty}
              </td>
              <td className="py-2 px-2 text-center border-r border-gray-300 text-gray-600">
                {item.unit}
              </td>
              <td className="py-2 px-2 text-right border-r border-gray-300">
                {item.rate?.toFixed(2)}
              </td>
              <td className="py-2 px-2 text-right font-medium">
                {item.taxableAmount?.toFixed(2)}
              </td>
            </tr>
          ))}
          {/* Add empty space to push footer down if needed */}
          <tr className="border-x border-gray-300">
            <td className="py-8 border-r border-gray-300"></td>
            <td className="border-r border-gray-300"></td>
            <td className="border-r border-gray-300"></td>
            <td className="border-r border-gray-300"></td>
            <td className="border-r border-gray-300"></td>
            <td className="border-r border-gray-300"></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
