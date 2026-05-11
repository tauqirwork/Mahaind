import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const mainLinks = [
    { to: '/dashboard', icon: 'dashboard', label: 'Client Summary' },
    { to: '/dispatch', icon: 'local_shipping', label: 'Dispatch Report' },
    { to: '/receivables', icon: 'account_balance_wallet', label: 'Receivables' },
    { to: '/payables', icon: 'payments', label: 'Payables' },
    { to: '/invoice-gen', icon: 'receipt_long', label: 'Invoice Gen' },
    { to: '/cashflow', icon: 'trending_up', label: 'Cash Flow' },
  ];

    const operationLinks = [
      { to: '/products', icon: 'shopping_bag', label: 'Products' },
      { to: '/production', icon: 'precision_manufacturing', label: 'Production' },
      { to: '/conversion', icon: 'sync', label: 'Conversion Sheets' },
      { to: '/calculator', icon: 'calculate', label: 'Calculator Entry' },
      { to: '/quotations', icon: 'request_quote', label: 'Quotations Tracker' },
      { to: '/team', icon: 'groups', label: 'Team KPIs' },
      { to: '/settings', icon: 'settings', label: 'Settings' },
    ];

  const renderLink = (link) => (
    <NavLink
      key={link.to}
      to={link.to}
      className={({ isActive }) => 
        isActive
          ? "flex items-center gap-3 px-4 py-3 bg-sky-50 text-sky-800 font-bold border-r-4 border-orange-600 scale-[0.98] transition-all duration-200"
          : "flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 transition-colors duration-200"
      }
    >
      <span className="material-symbols-outlined">{link.icon}</span>
      <span className="font-label text-sm">{link.label}</span>
    </NavLink>
  );

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-50 flex flex-col py-6 bg-slate-100 border-r border-slate-200 overflow-y-auto shrink-0 shadow-sm transition-all pb-10">
      <div className="mb-8 px-6 flex items-center gap-3">
        <img src="/maha-logo.png" alt="MahaIND Logo" className="h-10 w-auto object-contain shrink-0 drop-shadow-sm" />
        <div>
          <h1 className="text-xl font-bold text-sky-900 font-space tracking-tight">MahaIND</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Overseas Pvt Ltd</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col px-2">
        {/* Financial Section */}
        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold px-4 mb-2">Financial</p>
        <div className="flex flex-col gap-0.5 mb-5">
          {mainLinks.map(renderLink)}
        </div>

        {/* Operations Section */}
        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold px-4 mb-2">Operations</p>
        <div className="flex flex-col gap-0.5 mb-5">
          {operationLinks.map(renderLink)}
        </div>
      </nav>

    </aside>
  );
};

export default Sidebar;
