import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const getDefaultRoute = (role) => {
  if (role === 'qc') return '/conversion';
  return '/dashboard';
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center text-slate-400">
           <span className="material-symbols-outlined text-4xl mb-2 animate-spin slow">sync</span>
           <p className="text-xs font-bold uppercase tracking-widest">Verifying Identity</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Send immediately to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not authorized role -> Send back to default allowed route
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
