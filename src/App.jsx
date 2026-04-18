import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardDataProvider } from './hooks/useDashboardData';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import ClientSummary from './pages/ClientSummary';
import Dispatch from './pages/Dispatch';
import Receivables from './pages/Receivables';
import Payables from './pages/Payables';
import CashFlow from './pages/CashFlow';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Production from './pages/Production';
import Calculator from './pages/Calculator';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Quotations from './pages/Quotations';
import InvoiceGenerator from './pages/InvoiceGenerator';
import Team from './pages/Team';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <DashboardDataProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="flex bg-background min-h-screen text-slate-900 font-body">
                  <Sidebar />
                  
                  <main className="flex-1 ml-64 min-h-screen relative">
                    <TopNavBar />
                    
                    <div className="pt-24 px-10 pb-12 overflow-y-auto h-screen w-full">
                      <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in fade-in-up">
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<ClientSummary />} />
                            <Route path="/dispatch" element={<Dispatch />} />
                            <Route path="/receivables" element={<Receivables />} />
                            <Route path="/payables" element={<Payables />} />
                            <Route path="/cashflow" element={<CashFlow />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/production" element={<Production />} />
                            <Route path="/calculator" element={<Calculator />} />
                            <Route path="/quotations" element={<Quotations />} />
                            <Route path="/invoice-gen" element={<InvoiceGenerator />} />
                            
                            {/* Super Admin Protected Routes */}
                            <Route path="/team" element={
                               <ProtectedRoute allowedRoles={['super_admin']}>
                                  <Team />
                               </ProtectedRoute>
                            } />
                            <Route path="/settings" element={
                               <ProtectedRoute allowedRoles={['super_admin']}>
                                  <Settings />
                               </ProtectedRoute>
                            } />
                            
                            <Route path="/reports" element={<Reports />} />
                          </Routes>
                      </div>
                    </div>

                    {/* Contextual FAB from design */}
                    <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 border-b-4 border-orange-600">
                        <span className="material-symbols-outlined text-2xl">add_chart</span>
                    </button>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </DashboardDataProvider>
    </AuthProvider>
  );
}

export default App;
