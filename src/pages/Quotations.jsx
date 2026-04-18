import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Quotations = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
      quote_number: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
      client_name: '',
      total_amount: '',
      status: 'Pending'
  });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      
      // Step 1: Check if Quotations table actually exists by doing a silent select
      // If the user hasn't run the schema yet, this will fail gracefully.
      const { data, error: sbError } = await supabase
        .from('quotations')
        .select(`
          id, quote_number, total_amount, status, created_at, created_by,
          clients ( name )
        `)
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;
      setQuotations(data || []);
      setError(null);
    } catch (err) {
      if (err.code === '42P01') {
         setError("Supabase tables have not been created yet. Please run the provided SQL Schema script in your Supabase SQL Editor.");
      } else {
         setError(err.message || 'Failed to fetch Quotations.');
      }
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         // Create mock client first (in a real system, you'd select an existing client ID)
         const { data: clientData, error: clientErr } = await supabase
            .from('clients')
            .insert([{ name: formData.client_name }])
            .select()
            .single();

         if (clientErr && clientErr.code !== '42P01') throw clientErr;

         // If the user hasn't created the table, trigger the specific error
         if (clientErr && clientErr.code === '42P01') {
             throw new Error("Tables missing. Please run schema first.");
         }

         const client_id = clientData.id;

         // Insert Quote
         const { error: quoteErr } = await supabase
            .from('quotations')
            .insert([{
                quote_number: formData.quote_number,
                client_id: client_id,
                total_amount: parseFloat(formData.total_amount),
                status: formData.status,
                created_by: user?.email || 'Unknown'
            }]);

         if (quoteErr) throw quoteErr;
         
         setIsModalOpen(false);
         fetchQuotations();
      } catch (err) {
         setError(err.message);
      }
  };

  const updateStatus = async (id, currentStatus) => {
      const nextStatus = currentStatus === 'Pending' ? 'Accepted' : (currentStatus === 'Accepted' ? 'Rejected' : 'Pending');
      try {
         const { error } = await supabase
            .from('quotations')
            .update({ status: nextStatus })
            .eq('id', id);
         
         if (error) throw error;
         fetchQuotations();
      } catch (err) {
         setError(err.message);
      }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Accepted': return <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-[10px] tracking-wider uppercase">Accepted</span>;
      case 'Rejected': return <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-[10px] tracking-wider uppercase">Rejected</span>;
      default: return <span className="bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded text-[10px] tracking-wider uppercase">Pending</span>;
    }
  };

  return (
    <>
      <section className="flex justify-between items-end animate-fade-in relative z-10">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Active Quotations</h2>
          <p className="text-slate-500 text-sm mt-1">Live tracking database for pricing proposals.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded font-bold text-sm tracking-wide transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          NEW QUOTATION
        </button>
      </section>

      {error && (
         <div className="mt-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-2">
             <span className="material-symbols-outlined text-red-500 text-sm">error</span>
             {error}
           </div>
         </div>
      )}

      <section className="mt-8 bg-white border border-slate-200 rounded p-8 shadow-sm h-auto min-h-[500px]">
         {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 h-64">
               <span className="material-symbols-outlined text-4xl mb-2 animate-spin slow">sync</span>
               <p className="text-xs font-bold uppercase tracking-widest">Querying Supabase</p>
            </div>
         ) : quotations.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center text-slate-400 h-64 border-2 border-dashed border-slate-200 rounded">
               <span className="material-symbols-outlined text-5xl mb-4 text-slate-300">description</span>
               <h4 className="text-slate-700 font-space font-bold mb-1">No Active Quotes</h4>
               <p className="text-sm">Create a new quote to start syncing with Supabase.</p>
            </div>
         ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-4 px-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">ID / Info</th>
                    <th className="py-4 px-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">Client Name</th>
                    <th className="py-4 px-4 text-[10px] font-bold tracking-widest uppercase text-slate-500 text-right">Value (₹)</th>
                    <th className="py-4 px-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">Status</th>
                    <th className="py-4 px-4 text-[10px] font-bold tracking-widest uppercase text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {quotations.map((q) => (
                    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                         <div className="font-bold text-slate-900">{q.quote_number}</div>
                         <div className="text-[10px] text-slate-400">{new Date(q.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-4 font-medium">{q.clients?.name || 'Unknown Client'}</td>
                      <td className="py-4 px-4 text-right font-bold text-slate-800">
                         {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(q.total_amount)}
                      </td>
                      <td className="py-4 px-4">{renderStatusBadge(q.status)}</td>
                      <td className="py-4 px-4 text-right">
                         <button 
                            onClick={() => updateStatus(q.id, q.status)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded text-[10px] font-bold tracking-wide uppercase transition-colors"
                         >
                           Toggle Status
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         )}
      </section>

      {/* New Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border border-slate-200 relative overflow-hidden">
             
             {/* Visual Header */}
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-sky-600"></div>
             
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold font-space text-slate-900">New Quotation</h3>
                  <p className="text-xs text-slate-500">Syncs directly to Supabase PostgREST</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                   <span className="material-symbols-outlined">close</span>
                </button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Client Name</label>
                   <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-sky-400 focus:bg-white transition-colors" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Quoted Value (₹)</label>
                   <input required type="number" min="0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-sky-400 focus:bg-white transition-colors" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} />
                </div>
                <div className="pt-4 border-t border-slate-100 flex gap-3">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded font-bold text-[11px] tracking-wide w-full transition-colors">CANCEL</button>
                   <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-[11px] tracking-wide w-full transition-colors shadow-md">SAVE TO DB</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Quotations;
