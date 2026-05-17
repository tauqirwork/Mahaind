import React from 'react';

export function PartyDetails({ buyer, dispatch }) {
  if (!buyer) return null;
  return (
    <div className="grid grid-cols-12 gap-4 border-b border-gray-300 pb-4 mb-4">
      <div className="col-span-4">
        <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2">Billed To (Buyer)</h3>
        <div className="font-bold">{buyer.name}</div>
        <div className="text-xs whitespace-pre-wrap">{buyer.address}</div>
        <div className="text-xs mt-1"><strong>GSTIN:</strong> {buyer.gstin}</div>
        <div className="text-xs"><strong>State:</strong> {buyer.state} ({buyer.stateCode})</div>
      </div>
      <div className="col-span-4">
        <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2">Shipped To (Consignee)</h3>
        <div className="font-bold">{buyer.name}</div>
        <div className="text-xs whitespace-pre-wrap">{buyer.address}</div>
        <div className="text-xs mt-1"><strong>GSTIN:</strong> {buyer.gstin}</div>
        <div className="text-xs"><strong>State:</strong> {buyer.state} ({buyer.stateCode})</div>
      </div>
      <div className="col-span-4 border-l border-gray-300 pl-4">
        <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2">Dispatch Details</h3>
        <table className="w-full text-xs border-none m-0">
          <tbody>
            <tr><td className="font-medium pr-2 pb-1 border-none p-0 text-left">Buyer's Order No.</td><td className="border-none p-0 pb-1">{dispatch?.buyerOrderNo}</td></tr>
            <tr><td className="font-medium pr-2 pb-1 border-none p-0 text-left">Ref No. & Date</td><td className="border-none p-0 pb-1">{dispatch?.refNoDate}</td></tr>
            <tr><td className="font-medium pr-2 pb-1 border-none p-0 text-left">Dispatch Doc No.</td><td className="border-none p-0 pb-1">{dispatch?.dispatchDocNo}</td></tr>
            <tr><td className="font-medium pr-2 pb-1 border-none p-0 text-left">Dispatch Through</td><td className="border-none p-0 pb-1">{dispatch?.dispatchThrough}</td></tr>
            <tr><td className="font-medium pr-2 pb-1 border-none p-0 text-left">Destination</td><td className="border-none p-0 pb-1">{dispatch?.destination}</td></tr>
            <tr><td className="font-medium pr-2 pb-1 border-none p-0 text-left">Motor Vehicle No.</td><td className="border-none p-0 pb-1">{dispatch?.motorVehicleNo}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
