import React from 'react';

const KpiCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  theme = "sky", 
  percentage = "100", 
  trend = "", 
  isSolid = false 
}) => {

  const themes = {
    sky: { bg: 'bg-white border-slate-200 hover:border-sky-300', iconBg: 'bg-sky-50 text-sky-700', bar: 'bg-primary' },
    orange: { bg: 'bg-white border-slate-200 hover:border-orange-300', iconBg: 'bg-orange-50 text-orange-600', bar: 'bg-secondary' },
    green: { bg: 'bg-white border-slate-200 hover:border-green-300', iconBg: 'bg-green-50 text-green-700', bar: 'bg-tertiary' },
    solidPrimary: { bg: 'bg-primary text-white border-b-4 border-orange-600 shadow-lg group relative overflow-hidden', iconBg: 'bg-white/20 text-white', bar: 'bg-white/50' }
  };

  const t = themes[theme] || themes.sky;

  if (isSolid) {
    return (
      <div className={`col-span-12 md:col-span-3 p-6 rounded ${t.bg}`}>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className={`p-2 rounded ${t.iconBg}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          {trend && <span className="text-xs font-bold text-orange-400 font-space">{trend}</span>}
        </div>
        <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold mb-1 relative z-10">{title}</p>
        <h3 className="text-3xl font-bold font-space relative z-10">{value}</h3>
        {subtitle && (
          <p className="mt-4 text-[10px] text-white/60 font-medium flex items-center gap-1 relative z-10 uppercase tracking-tighter">
            <span className="material-symbols-outlined text-[14px] text-orange-500">verified</span>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`col-span-12 md:col-span-3 border p-6 rounded shadow-sm transition-colors ${t.bg}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded ${t.iconBg}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && <span className="text-xs font-bold text-slate-500 font-space uppercase">{trend}</span>}
      </div>
      <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">{title}</p>
      <h3 className="text-3xl font-bold font-space text-slate-900">{value}</h3>
      <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${t.bar}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default KpiCard;
