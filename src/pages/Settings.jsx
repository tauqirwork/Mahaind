import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, addConversionSheet, extractSheetId } from '../services/settingsService';
import { supabase } from '../utils/supabaseClient';

const Settings = () => {
  const [settings, setSettings] = useState(getSettings());
  const [newMonth, setNewMonth] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Admin Provisioning State
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState(null);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({ full_name: '', email: '', role: 'viewer', department: '' });
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoadingProfiles(true);
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        if (err.code === '42P01') {
           setProfilesError("Phase IV Schema missing. Run schema script to enable User Management.");
        } else {
           setProfilesError(err.message);
        }
      } finally {
        setLoadingProfiles(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleProvisionOperator = async (e) => {
    e.preventDefault();
    if (!newProfile.full_name || !newProfile.email) return;
    setIsSubmittingProfile(true);
    try {
       // Note: We use a random UUID here for testing. Real prod needs auth.users foreign key.
       const newId = crypto.randomUUID();
       const { error: insertErr } = await supabase.from('profiles').insert([{
          id: newId,
          full_name: newProfile.full_name,
          email: newProfile.email,
          role: newProfile.role,
          department: newProfile.department || 'General Operations',
          status: 'Active'
       }]);
       if (insertErr) throw insertErr;
       
       setIsProfileModalOpen(false);
       setNewProfile({ full_name: '', email: '', role: 'viewer', department: '' });
       
       // Refresh list
       const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
       if (data) setProfiles(data);
       
    } catch (err) {
       alert("Provisioning failed: " + err.message + "\n\n(Did you run the Drop Constraint script?)");
    } finally {
       setIsSubmittingProfile(false);
    }
  };

  const handleAddSheet = () => {
    if (!newMonth || !newUrl) return;
    const sheetId = extractSheetId(newUrl);
    if (!sheetId) {
      setSaveMessage('Invalid URL or Sheet ID. Please paste a valid Google Sheets link.');
      return;
    }
    const updated = addConversionSheet(newMonth, sheetId);
    setSettings(updated);
    setNewMonth('');
    setNewUrl('');
    setSaveMessage(`Added "${newMonth}" conversion sheet successfully!`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleActivateSheet = (index) => {
    const updated = { ...settings };
    updated.conversionSheetUrls = updated.conversionSheetUrls.map((s, i) => ({
      ...s,
      active: i === index,
    }));
    updated.conversionSheetId = updated.conversionSheetUrls[index].sheetId;
    saveSettings(updated);
    setSettings(updated);
    setSaveMessage('Active sheet changed. Reload the Production page to see updated data.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <>
      <section className="flex justify-between items-end animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold font-space text-slate-900 tracking-tight">Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage data source configuration for the dashboard.</p>
        </div>
      </section>

      {/* Success Message */}
      {saveMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded p-4 flex items-center gap-3 animate-fade-in mb-6">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <p className="text-sm font-medium">{saveMessage}</p>
        </div>
      )}

      {/* Admin Operations: User Provisioning */}
      <section className="bg-slate-900 border border-slate-800 rounded p-8 shadow-sm animate-fade-in mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
           <span className="material-symbols-outlined select-none" style={{fontSize: '200px', transform: 'translate(20%, -20%)'}}>admin_panel_settings</span>
        </div>
        
        <div className="relative z-10 flex justify-between items-center mb-6">
           <div>
             <h4 className="text-lg font-bold font-space text-white uppercase tracking-tight mb-1">MahaIND Access Control</h4>
             <p className="text-sm text-slate-400">Manage authenticated operators and operational roles.</p>
           </div>
           <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded text-[11px] font-bold tracking-wider transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              PROVISION NEW OPERATOR
           </button>
        </div>

        {profilesError ? (
           <div className="bg-slate-800/50 border border-red-500/30 text-red-400 p-4 rounded text-sm relative z-10">
              <span className="font-bold">Database Error:</span> {profilesError}
           </div>
        ) : loadingProfiles ? (
           <div className="text-slate-500 text-sm animate-pulse relative z-10">Syncing profiles from PostgREST...</div>
        ) : (
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.length === 0 ? (
                 <div className="col-span-full text-slate-500 text-sm border border-slate-700 border-dashed rounded p-6 text-center">
                    No active operator profiles found. Provision an operator to start tracking KPIs.
                 </div>
              ) : profiles.map(profile => (
                 <div key={profile.id} className="bg-slate-800 border border-slate-700 hover:border-sky-500/50 transition-colors p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                       <h5 className="text-white font-bold">{profile.full_name || profile.email}</h5>
                       <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${profile.role === 'super_admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-300'}`}>
                          {profile.role.replace('_', ' ')}
                       </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{profile.department || 'General Operations'}</p>
                    <div className="flex gap-2">
                       <button className="text-[10px] text-slate-300 hover:text-white uppercase font-bold tracking-wider">Edit Role</button>
                       <span className="text-slate-600">•</span>
                       <button className="text-[10px] text-red-400 hover:text-red-300 uppercase font-bold tracking-wider">Suspend</button>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </section>

      {/* NEW PROFILE MODAL */}
      {isProfileModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Provision Operator</h3>
                  <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                     <span className="material-symbols-outlined">close</span>
                  </button>
               </div>
               
               <form onSubmit={handleProvisionOperator} className="space-y-4">
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Full Name</label>
                     <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" placeholder="e.g. Rahul Sharma" value={newProfile.full_name} onChange={e => setNewProfile({...newProfile, full_name: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Email</label>
                     <input type="email" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" placeholder="operator@mahaind.com" value={newProfile.email} onChange={e => setNewProfile({...newProfile, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Department</label>
                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" placeholder="e.g. Extrusion" value={newProfile.department} onChange={e => setNewProfile({...newProfile, department: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Role</label>
                        <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500" value={newProfile.role} onChange={e => setNewProfile({...newProfile, role: e.target.value})}>
                           <option value="viewer">Operator (Viewer)</option>
                           <option value="super_admin">Manager (Super Admin)</option>
                        </select>
                     </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-2 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded hover:bg-slate-50">Cancel</button>
                     <button type="submit" disabled={isSubmittingProfile} className="flex-1 py-2 bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-sky-500 disabled:opacity-50">
                        {isSubmittingProfile ? 'Provisioning...' : 'Provision'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Data Sources */}
      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
        <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight mb-1">Google Sheet Sources</h4>
        <p className="text-xs text-slate-500 mb-6">These are the static data source IDs. They rarely change.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded p-4 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Bag Master</p>
            <p className="text-xs font-mono text-slate-700 break-all">{settings.bagMasterSheetId}</p>
          </div>
          <div className="bg-slate-50 rounded p-4 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Stock Report</p>
            <p className="text-xs font-mono text-slate-700 break-all">{settings.stockReportSheetId}</p>
          </div>
          <div className="bg-slate-50 rounded p-4 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Active Conversion</p>
            <p className="text-xs font-mono text-slate-700 break-all">{settings.conversionSheetId}</p>
          </div>
        </div>
      </section>

      {/* Monthly Conversion Sheets */}
      <section className="bg-white border border-slate-200 rounded p-8 shadow-sm animate-fade-in">
        <h4 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight mb-1">Monthly Conversion Sheets</h4>
        <p className="text-xs text-slate-500 mb-6">Add a new month's conversion sheet URL. The active sheet is used for Production metrics.</p>

        {/* Add New Sheet */}
        <div className="bg-slate-50 rounded p-5 border border-slate-200 mb-6">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Add New Month</p>
          <div className="flex gap-3 items-end">
            <div className="flex-shrink-0">
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Month Label</label>
              <input
                type="text"
                className="border border-slate-300 rounded px-3 py-2 text-sm w-36 focus:outline-none focus:border-primary"
                placeholder="e.g. Apr 2026"
                value={newMonth}
                onChange={e => setNewMonth(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Google Sheet URL or ID</label>
              <input
                type="text"
                className="border border-slate-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"
                placeholder="Paste the full Google Sheets URL..."
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddSheet}
              className="px-5 py-2 bg-primary text-white rounded font-bold text-xs shadow-sm hover:opacity-90 transition-all tracking-wider shrink-0"
            >
              ADD SHEET
            </button>
          </div>
        </div>

        {/* Sheet List */}
        <div className="space-y-2">
          {settings.conversionSheetUrls.map((sheet, i) => (
            <div
              key={i}
              className={`flex items-center justify-between border rounded p-4 transition-colors ${
                sheet.active
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {sheet.active && (
                  <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900">{sheet.month}</p>
                  <p className="text-xs font-mono text-slate-500">{sheet.sheetId}</p>
                </div>
              </div>
              {!sheet.active && (
                <button
                  onClick={() => handleActivateSheet(i)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  SET ACTIVE
                </button>
              )}
              {sheet.active && (
                <span className="text-xs font-bold text-green-600 uppercase">Active</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Settings;
