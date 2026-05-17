import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { role } = useAuth();
  
  const mainLinks = [
    { to: '/dashboard', icon: 'dashboard', label: 'Client Summary', roles: ['super_admin', 'manager', 'director', 'accountant'] },
    { to: '/dispatch', icon: 'local_shipping', label: 'Dispatch Report', roles: ['super_admin', 'manager', 'director', 'accountant'] },
    { to: '/receivables', icon: 'account_balance_wallet', label: 'Receivables', roles: ['super_admin', 'manager', 'director', 'accountant'] },
    { to: '/payables', icon: 'payments', label: 'Payables', roles: ['super_admin', 'manager', 'director', 'accountant'] },
    { to: '/invoice-gen', icon: 'receipt_long', label: 'Invoice Gen', roles: ['super_admin', 'manager', 'director', 'accountant'] },
    { to: '/cashflow', icon: 'trending_up', label: 'Cash Flow', roles: ['super_admin', 'manager', 'director', 'accountant'] },
  ];

  const operationLinks = [
    { to: '/products', icon: 'shopping_bag', label: 'Products', roles: ['super_admin', 'manager', 'director'] },
    { to: '/production', icon: 'precision_manufacturing', label: 'Production', roles: ['super_admin', 'manager', 'director'] },
    { to: '/conversion', icon: 'sync', label: 'Conversion Sheets', roles: ['super_admin', 'manager', 'director', 'qc'] },
    { to: '/calculator', icon: 'calculate', label: 'Calculator Entry', roles: ['super_admin', 'manager', 'director'] },

    { to: '/team', icon: 'groups', label: 'Team & Users', roles: ['super_admin', 'manager', 'director'] },
    { to: '/settings', icon: 'settings', label: 'Settings', roles: ['super_admin'] },
  ];

  const hrLinks = [
    { to: '/payroll', icon: 'payments', label: 'Attendance & Payroll', roles: ['super_admin', 'manager'] }
  ];

  const renderLink = (link) => {
    if (link.roles && !link.roles.includes(role)) return null;
    return (
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
  };

  const hasLinks = (links) => links.some(link => !link.roles || link.roles.includes(role));

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
        {hasLinks(mainLinks) && (
          <>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold px-4 mb-2">Financial</p>
            <div className="flex flex-col gap-0.5 mb-5">
              {mainLinks.map(renderLink)}
            </div>
          </>
        )}

        {hasLinks(operationLinks) && (
          <>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold px-4 mb-2">Operations</p>
            <div className="flex flex-col gap-0.5 mb-5">
              {operationLinks.map(renderLink)}
            </div>
          </>
        )}

        {hasLinks(hrLinks) && (
          <>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold px-4 mb-2">HR & Payroll</p>
            <div className="flex flex-col gap-0.5 mb-5">
              {hrLinks.map(renderLink)}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
