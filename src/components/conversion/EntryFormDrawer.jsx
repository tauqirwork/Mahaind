import React from 'react';
import TapelineForm from './forms/TapelineForm';
import RolldownForm from './forms/RolldownForm';
import LinerForm from './forms/LinerForm';
import PrintingForm from './forms/PrintingForm';
import BOPPForm from './forms/BOPPForm';
import BCSForm from './forms/BCSForm';
import BalingForm from './forms/BalingForm';
import LoomQCForm from './forms/LoomQCForm';
import LinerQCForm from './forms/LinerQCForm';
import PrintingQCForm from './forms/PrintingQCForm';
import PrintingInkQCForm from './forms/PrintingInkQCForm';
import BOPPQCForm from './forms/BOPPQCForm';
import BCSQCForm from './forms/BCSQCForm';
import ManualStitchQCForm from './forms/ManualStitchQCForm';

const FORMS = {
  tapeline: TapelineForm,
  rolldown: RolldownForm,
  liner: LinerForm,
  printing: PrintingForm,
  bopp: BOPPForm,
  bcs: BCSForm,
  baling: BalingForm,
  loom_qc: LoomQCForm,
  liner_qc: LinerQCForm,
  printing_qc: PrintingQCForm,
  printing_ink_qc: PrintingInkQCForm,
  bopp_qc: BOPPQCForm,
  bcs_qc: BCSQCForm,
  manual_stitch_qc: ManualStitchQCForm,
};

export default function EntryFormDrawer({ isOpen, onClose, activeTab, onSubmitSuccess }) {
  if (!isOpen) return null;

  const ActiveForm = FORMS[activeTab];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col transform transition-transform">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold font-space text-slate-900 uppercase tracking-tight">Add New Entry</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {ActiveForm ? (
              <ActiveForm onSubmitSuccess={onSubmitSuccess} />
            ) : (
              <p className="text-red-500">Form not found for this tab.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
