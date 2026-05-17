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
import DocumentPreviewer from './pages/DocumentPreviewer';
import ConversionSheets from './pages/ConversionSheets';
import Settings from './pages/Settings';
import Quotations from './pages/Quotations';
import InvoiceGenerator from './pages/InvoiceGenerator';
import Team from './pages/Team';
import Login from './pages/Login';
import PayrollModule from './modules/payroll';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const finRoles = ['super_admin', 'manager', 'director', 'accountant'];
  const opRoles = ['super_admin', 'manager', 'director'];
  
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
                            
                            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={finRoles}><ClientSummary /></ProtectedRoute>} />
                            <Route path="/dispatch" element={<ProtectedRoute allowedRoles={finRoles}><Dispatch /></ProtectedRoute>} />
                            <Route path="/receivables" element={<ProtectedRoute allowedRoles={finRoles}><Receivables /></ProtectedRoute>} />
                            <Route path="/payables" element={<ProtectedRoute allowedRoles={finRoles}><Payables /></ProtectedRoute>} />
                            <Route path="/cashflow" element={<ProtectedRoute allowedRoles={finRoles}><CashFlow /></ProtectedRoute>} />
                            <Route path="/invoices" element={<ProtectedRoute allowedRoles={finRoles}><DocumentPreviewer /></ProtectedRoute>} />
                            <Route path="/invoice-gen" element={<ProtectedRoute allowedRoles={finRoles}><InvoiceGenerator /></ProtectedRoute>} />
                            
                            <Route path="/inventory" element={<ProtectedRoute allowedRoles={opRoles}><Inventory /></ProtectedRoute>} />
                            <Route path="/products" element={<ProtectedRoute allowedRoles={opRoles}><Products /></ProtectedRoute>} />
                            <Route path="/production" element={<ProtectedRoute allowedRoles={opRoles}><Production /></ProtectedRoute>} />
                            <Route path="/calculator" element={<ProtectedRoute allowedRoles={opRoles}><Calculator /></ProtectedRoute>} />
                            <Route path="/quotations" element={<ProtectedRoute allowedRoles={opRoles}><Quotations /></ProtectedRoute>} />
                            <Route path="/team" element={<ProtectedRoute allowedRoles={opRoles}><Team /></ProtectedRoute>} />
                            
                            <Route path="/conversion" element={<ProtectedRoute allowedRoles={[...opRoles, 'qc']}><ConversionSheets /></ProtectedRoute>} />
                            
                            <Route path="/payroll" element={<ProtectedRoute allowedRoles={['super_admin', 'manager']}><PayrollModule /></ProtectedRoute>} />
                            
                            <Route path="/settings" element={
                               <ProtectedRoute allowedRoles={['super_admin']}>
                                  <Settings />
                               </ProtectedRoute>
                            } />
                            
                            {/* Fallback for unauthorized/not found */}
                            <Route path="*" element={
                               <div className="p-8 text-center text-slate-500">
                                  <h2 className="text-2xl font-bold mb-2">Access Denied or Not Found</h2>
                                  <p>You do not have permission to view this page or it does not exist.</p>
                               </div>
                            } />
                          </Routes>
                      </div>
                    </div>
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
