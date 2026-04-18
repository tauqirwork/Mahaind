import React, { useState, useEffect } from 'react';

const Calculator = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('mahaind_calculator_url');
    if (saved) {
      setSheetUrl(saved);
      setActiveUrl(saved);
      setIsEditing(false);
    }
  }, []);

  const handleSave = () => {
    if (!sheetUrl) return;
    
    // Convert standard Google Docs URL to embedded URL if necessary
    let embedUrl = sheetUrl;
    if (sheetUrl.includes('/edit')) {
      embedUrl = sheetUrl.replace(/\/edit.*$/, '/htmlembed?widget=true&headers=false');
    }

    localStorage.setItem('mahaind_calculator_url', embedUrl);
    setActiveUrl(embedUrl);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <section className="flex justify-between items-end mb-6 animate-fade-in shrink-0">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Pricing Engine</h2>
          <p className="text-slate-500 text-sm mt-1">Live synchronized spreadsheet for automated quoting and cost distributions.</p>
        </div>
        {!isEditing && activeUrl && (
          <button 
            onClick={handleEdit}
            className="px-5 py-2 border border-slate-300 text-slate-600 hover:text-sky-700 hover:border-sky-300 rounded font-bold text-xs transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">edit</span> CONFIGURE SOURCE
          </button>
        )}
      </section>

      {/* Setup View */}
      {(isEditing || !activeUrl) && (
        <section className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 animate-fade-in shrink-0 mb-6">
           <div className="max-w-2xl">
              <h3 className="font-bold text-slate-800 text-lg mb-2">Configure Google Sheets Calculator</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                To guarantee mathematical accuracy without breaking your proprietary algorithms, we embed your Production Calculator directly. Please upload your `Production Calculator `.xlsm file to Google Drive, open it as a Google Sheet, and paste the URL below.
              </p>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Google Sheet Web Link</label>
                  <input 
                    type="url" 
                    className="w-full border border-slate-300 rounded px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
                    placeholder="https://docs.google.com/spreadsheets/d/1XyZ.../edit"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-primary text-white rounded font-bold text-sm shadow-md shadow-primary/30 hover:opacity-90 transition-all tracking-wider shrink-0"
                >
                  CONNECT SHEET
                </button>
              </div>
           </div>
        </section>
      )}

      {/* Embedded Iframe View */}
      {!isEditing && activeUrl && (
        <section className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-fade-in relative min-h-[500px]">
           <div className="absolute inset-0 bg-slate-50 flex items-center justify-center -z-10">
              <div className="flex flex-col items-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 animate-spin slow">sync</span>
                <p className="text-xs font-bold uppercase tracking-widest">Loading Engine</p>
              </div>
           </div>
           <iframe 
             src={activeUrl}
             className="w-full h-full border-none z-10 relative bg-white"
             title="MahaIND Production Calculator Engine"
             allowFullScreen
           />
        </section>
      )}
    </div>
  );
};

export default Calculator;
