import React, { useState, useEffect } from 'react';
import { getToken } from '../services/sheetsApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Calculator = () => {
  const [inputs, setInputs] = useState({
    bagWidth: 24,
    bagLength: 36,
    bagWeight: 170,
    mesh: "10 X 10",
    quantity: 10000,
    linerRequired: false,
    linerWeight: 0,
    bagType: "Non-Lamination",
    printingColors: 0,
    topStitching: "None",
    bottomStitching: "None",
    productionTypeCode: "Type E",
    ppPct: 0.85,
    fillerPct: 0.13,
    mbPct: 0.02,
    profitTarget: 15,
    dispatchKm: 150
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    if (type === 'number') val = Number(value);
    setInputs(prev => ({ ...prev, [name]: val }));
  };

  useEffect(() => {
    const calculate = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(inputs)
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(calculate, 500);
    return () => clearTimeout(debounceTimer);
  }, [inputs]);

  return (
    <div className="pb-12">
      <section className="mb-6 animate-fade-in shrink-0">
        <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Production Calculator</h2>
        <p className="text-slate-500 text-sm mt-1">Live calculation engine based on MOPL technical specification.</p>
      </section>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INPUTS PANEL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Basic Order Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">shopping_cart</span> Order Info
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Quantity (Bags)</label>
                <input type="number" name="quantity" value={inputs.quantity} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Profit Target (%)</label>
                <input type="number" name="profitTarget" value={inputs.profitTarget} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Dispatch Distance (KM)</label>
                <input type="number" name="dispatchKm" value={inputs.dispatchKm} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Section 2: Bag Specs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">design_services</span> Bag Specifications
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Bag Type</label>
                <select name="bagType" value={inputs.bagType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none bg-white">
                  <option value="Non-Lamination">Non-Lamination</option>
                  <option value="Lamination">Lamination</option>
                  <option value="Single BOPP + Lamination">Single BOPP + Lamination</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Production Type</label>
                <select name="productionTypeCode" value={inputs.productionTypeCode} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none bg-white">
                  <option value="Type A">Type A</option>
                  <option value="Type B">Type B</option>
                  <option value="Type C">Type C</option>
                  <option value="Type E">Type E</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Mesh Size</label>
                <select name="mesh" value={inputs.mesh} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none bg-white">
                  <option value="10 X 10">10 X 10</option>
                  <option value="11 X 11">11 X 11</option>
                  <option value="12 X 12">12 X 12</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Total Weight (g)</label>
                <input type="number" name="bagWeight" value={inputs.bagWeight} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Width (inch)</label>
                <input type="number" step="0.5" name="bagWidth" value={inputs.bagWidth} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Length (inch)</label>
                <input type="number" step="0.5" name="bagLength" value={inputs.bagLength} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Section 3: Stitching */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">straighten</span> Stitching
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Top Stitching</label>
                <select name="topStitching" value={inputs.topStitching} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none bg-white">
                  <option value="None">None</option>
                  <option value="Folded and Stitched (Top Hemming)">Top Hemming</option>
                  <option value="Single Fold Single Stitch (SFSS)">SFSS</option>
                  <option value="Double Fold Double Stitch (DFDS)">DFDS</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Bottom Stitching</label>
                <select name="bottomStitching" value={inputs.bottomStitching} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none bg-white">
                  <option value="None">None</option>
                  <option value="Single Fold Single Stitch (SFSS)">SFSS</option>
                  <option value="Double Fold Double Stitch (DFDS)">DFDS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Composition */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">science</span> Bag Composition
              </h3>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">Must equal 100%</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">PP %</label>
                <input type="number" step="0.01" name="ppPct" value={inputs.ppPct} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">Filler %</label>
                <input type="number" step="0.01" name="fillerPct" value={inputs.fillerPct} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase mb-1 block">MB %</label>
                <input type="number" step="0.01" name="mbPct" value={inputs.mbPct} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full ${((inputs.ppPct + inputs.fillerPct + inputs.mbPct) * 100) > 100 ? 'bg-red-500' : 'bg-primary'}`} 
                style={{ width: `${Math.min((inputs.ppPct + inputs.fillerPct + inputs.mbPct) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* RESULTS PANEL */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border-2 border-orange-500 text-slate-800 p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">monitoring</span> Calculation Results
              </h3>
              {loading && <span className="material-symbols-outlined animate-spin text-primary">sync</span>}
            </div>

            {!results ? (
              <div className="text-sm text-slate-500 text-center py-8">Awaiting calculations...</div>
            ) : (
              <div className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cut Size</p>
                    <p className="font-bold text-lg text-slate-900">{results.bagCutWidth}" × {results.bagCutLength}"</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fabric Weight</p>
                    <p className="font-bold text-lg text-slate-900">{results.fabricWeight_g}g</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">GSM</p>
                    <p className="font-mono text-sm font-medium">{results.gsm}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Denier</p>
                    <p className="font-mono text-sm font-medium">{results.denier}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Meters</p>
                    <p className="font-mono text-sm font-medium">{results.totalFabricMeters}</p>
                  </div>
                </div>

                <div className="space-y-2 pb-4 border-b border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Raw Material (Bag)</span>
                    <span className="font-medium text-slate-900">₹{results.bagRmCost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">OPEX / Bag</span>
                    <span className="font-medium text-slate-900">₹{results.opex}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Production Cost</span>
                    <span className="font-medium text-slate-900">₹{results.productionCostWastage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Transport / Bag</span>
                    <span className="font-medium text-slate-900">₹{results.transportCostPerBag}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-blue-500 text-sm">lightbulb</span>
                    <p className="text-[10px] text-blue-800 uppercase font-bold tracking-wider">Recommended Quote Range</p>
                  </div>
                  <p className="font-bold text-blue-700 text-2xl">₹{results.minQuote} <span className="text-blue-500/70 text-sm mx-2 font-medium">to</span> ₹{results.maxQuote}</p>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                    <p className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Selected Rate (Inc. Profit)</p>
                  </div>
                  <p className="font-bold text-4xl text-emerald-700 tracking-tight">₹{results.selectedRate}</p>
                </div>

                <div className="bg-slate-900 rounded-xl p-5 shadow-lg mt-4 space-y-3 text-white">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Final Amount</span>
                    <span className="font-mono font-bold text-slate-100 text-base">₹{results.finalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">GST (18%)</span>
                    <span className="font-mono font-bold text-slate-100 text-base">₹{results.gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-black text-white pt-3 border-t border-slate-700">
                    <span className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-orange-500">payments</span>
                       Gross Payable
                    </span>
                    <span className="text-2xl text-orange-400">₹{results.grossPayable.toLocaleString()}</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Calculator;
