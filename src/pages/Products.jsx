import React, { useState, useEffect, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import { fetchProductCatalog } from '../services/productService';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

const Products = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBag, setSelectedBag] = useState(null);
  const [clientFilter, setClientFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await fetchProductCatalog();
        setData(result);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const clients = useMemo(() => {
    if (!data?.catalog) return [];
    const unique = [...new Set(data.catalog.map(b => b.clientName))].sort();
    return unique;
  }, [data]);

  const filteredBags = useMemo(() => {
    if (!data?.catalog) return [];
    let result = data.catalog;
    if (clientFilter) result = result.filter(b => b.clientName === clientFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.bagSpecs.toLowerCase().includes(term) ||
        b.clientName.toLowerCase().includes(term) ||
        b.fabricDescription.toLowerCase().includes(term)
      );
    }
    return result;
  }, [data, clientFilter, searchTerm]);

  if (error) return <div className="text-red-500 font-bold p-8">Failed to load product catalog: {error.message}</div>;

  // Bag Detail Slide-out Panel
  const DetailPanel = ({ bag, onClose }) => {
    if (!bag) return null;

    const formEntries = Object.entries(bag.formulation || {}).filter(([, v]) => v > 0);
    const rmColors = {
      pp: '#00668B', filler: '#FF6B00', mb: '#7C3AED', modifier: '#DB2777',
      ld: '#059669', uv: '#D97706', rp: '#4F46E5',
    };
    const rmLabels = {
      pp: 'Polypropylene (PP)', filler: 'Filler', mb: 'Masterbatch', modifier: 'Modifier',
      ld: 'LDPE', uv: 'UV Stabilizer', rp: 'Reprocessed',
    };

    return (
      <div className="fixed inset-0 z-[100] flex justify-end">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl animate-slide-in">
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-6 flex justify-between items-start z-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">{bag.clientName}</p>
              <h3 className="text-xl font-bold font-space text-slate-900">{bag.bagSpecs}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Specifications */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Specifications</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Width', `${bag.width}"`],
                  ['Length', `${bag.length}"`],
                  ['Cut Width', `${bag.cutWidth}"`],
                  ['Cut Length', `${bag.cutLength}"`],
                  ['Denier', bag.denier],
                  ['Tape Width', `${bag.tapeWidth} mm`],
                  ['Mesh', bag.mesh],
                  ['Meter Weight', `${bag.meterWeight} g`],
                  ['Fabric Weight', `${bag.fabricWeight} g`],
                  ['Total Bag Weight', `${bag.totalBagWeight} g`],
                  ['Unit', bag.unit],
                  ['Fabric Code', bag.fabricCode],
                ].map(([label, value], i) => (
                  <div key={i} className="bg-slate-50 rounded p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
                    <p className="text-sm font-bold text-slate-900 font-space">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulation */}
            {formEntries.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">RM Formulation</h4>
                {/* Visual bar */}
                <div className="flex h-6 rounded-full overflow-hidden mb-4 shadow-inner">
                  {formEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="h-full transition-all"
                      style={{
                        width: `${val * 100}%`,
                        backgroundColor: rmColors[key] || '#94A3B8',
                        minWidth: val > 0 ? '8px' : 0,
                      }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {formEntries.map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: rmColors[key] || '#94A3B8' }} />
                      <span className="text-xs text-slate-600">{rmLabels[key] || key}</span>
                      <span className="text-xs font-bold font-space text-slate-900 ml-auto">{(val * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Costing & Profitability */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Costing & Profitability</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">PO Rate</span>
                  <span className="text-sm font-bold font-space text-slate-900">{formatCurrency(bag.poRate)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">Selling Price (incl. GST)</span>
                  <span className="text-sm font-bold font-space text-slate-900">{formatCurrency(bag.sellingPriceGST)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">Production Cost</span>
                  <span className="text-sm font-bold font-space text-slate-900">{formatCurrency(bag.productionCost)}</span>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className={`flex justify-between items-center p-4 rounded ${bag.isProfitable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <span className="text-sm font-bold text-slate-700">Profit / Bag</span>
                  <div className="text-right">
                    <p className={`text-lg font-bold font-space ${bag.isProfitable ? 'text-green-700' : 'text-red-600'}`}>
                      {formatCurrency(bag.profitAmount)}
                    </p>
                    <p className={`text-xs font-bold ${bag.isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                      {(bag.profitPercent * 100).toFixed(1)}% margin
                    </p>
                  </div>
                </div>
                {bag.saleQty > 0 && (
                  <div className="flex justify-between items-center p-3 bg-sky-50 rounded border border-sky-200">
                    <span className="text-sm text-slate-600">Total Units Sold</span>
                    <span className="text-sm font-bold font-space text-sky-800">{bag.saleQty.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <section className="flex justify-between items-end animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Bag Product Catalog</h2>
          <p className="text-slate-500 text-sm mt-1">Centralized product intelligence with formulation & cost analysis.</p>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-12 gap-6 animate-fade-in">
        <KpiCard
          title="Total Products"
          value={isLoading ? '—' : data?.stats?.totalProducts || 0}
          icon="inventory"
          theme="sky"
        />
        <KpiCard
          title="Profitable SKUs"
          value={isLoading ? '—' : data?.stats?.profitableCount || 0}
          icon="trending_up"
          theme="green"
        />
        <KpiCard
          title="Avg Profit Margin"
          value={isLoading ? '—' : `${((data?.stats?.avgProfit || 0) * 100).toFixed(1)}%`}
          icon="analytics"
          theme="solidPrimary"
          isSolid={true}
          subtitle="Across all SKUs"
        />
        <KpiCard
          title="Client Base"
          value={isLoading ? '—' : clients.length}
          icon="group"
          theme="orange"
        />
      </section>

      {/* Filters */}
      <section className="flex gap-4 items-center animate-fade-in">
        <div className="flex items-center bg-white border border-slate-200 rounded px-4 py-2 w-72 shadow-sm">
          <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
          <input
            className="bg-transparent border-none text-sm w-full focus:outline-none ml-2 placeholder:text-slate-400"
            placeholder="Search bags, clients..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-white border border-slate-200 rounded px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:outline-none"
          value={clientFilter}
          onChange={e => setClientFilter(e.target.value)}
        >
          <option value="">All Clients</option>
          {clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs text-slate-500 ml-auto">{filteredBags.length} products</span>
      </section>

      {/* Bag Grid */}
      <section className="animate-fade-in">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded p-5 shadow-sm animate-pulse">
                <div className="h-28 bg-slate-100 rounded mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBags.map((bag, i) => (
              <div
                key={i}
                onClick={() => setSelectedBag(bag)}
                className="bg-white border border-slate-200 rounded p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group"
              >
                {/* Bag visual placeholder */}
                <div className="h-28 bg-gradient-to-br from-slate-50 to-slate-100 rounded mb-4 flex items-center justify-center group-hover:from-sky-50 group-hover:to-sky-100 transition-colors">
                  <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary/50 transition-colors">shopping_bag</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1 truncate">{bag.clientName}</p>
                <h4 className="text-sm font-bold font-space text-slate-900 mb-2 leading-tight line-clamp-2">{bag.bagSpecs}</h4>
                <p className="text-[10px] text-slate-500 mb-3 truncate">{bag.fabricDescription}</p>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Weight</p>
                    <p className="text-xs font-space font-bold text-slate-700">{bag.totalBagWeight}g</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Size</p>
                    <p className="text-xs font-space font-bold text-slate-700">{bag.width}" × {bag.length}"</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Margin</p>
                    <p className={`text-xs font-space font-bold ${bag.isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                      {bag.profitPercent ? `${(bag.profitPercent * 100).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Detail Panel */}
      {selectedBag && <DetailPanel bag={selectedBag} onClose={() => setSelectedBag(null)} />}
    </>
  );
};

export default Products;
