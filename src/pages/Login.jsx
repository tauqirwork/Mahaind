import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRoute } from '../components/ProtectedRoute';

const Login = () => {
  const { login, user, role, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && role) {
      navigate(getDefaultRoute(role), { replace: true });
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sky-200/50 rounded-full blur-[100px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-200/40 rounded-full blur-[120px] z-0 pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 relative z-10 border border-slate-100">
        <div className="flex flex-col items-center mb-10">
           <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-sky-500/30">
               <span className="material-symbols-outlined text-3xl">precision_manufacturing</span>
           </div>
           <h1 className="text-3xl font-bold font-space text-slate-800 tracking-tight">MahaIND</h1>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Core</p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-sm">error</span>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Operator Email</label>
             <div className="relative">
               <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400 text-[20px]">mail</span>
               <input 
                 type="email" 
                 required
                 className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all outline-none"
                 placeholder="admin@mahaind.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />
             </div>
          </div>
          
          <div>
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Access Key</label>
             <div className="relative">
               <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400 text-[20px]">lock</span>
               <input 
                 type="password" 
                 required
                 className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all outline-none"
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
               />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm shadow-md transition-colors flex justify-center items-center gap-2 mt-4"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
            ) : (
              <>AUTHENTICATE <span className="material-symbols-outlined text-sm">arrow_forward</span></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
           <p className="text-[10px] text-slate-400 font-medium">Secured by Engine Supabase OAuth</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
