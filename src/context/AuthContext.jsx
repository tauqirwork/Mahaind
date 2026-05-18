import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        // Check for manual DB login
        const manualSessionStr = localStorage.getItem('manual-session');
        if (manualSessionStr) {
           const manualSession = JSON.parse(manualSessionStr);
           setUser(manualSession.user);
           setRole(manualSession.role); // Set optimistic role
           
           // Re-fetch latest role from DB to ensure they weren't demoted
           if (manualSession.user?.id && !manualSession.user.id.startsWith('mock-')) {
               fetchUserRole(manualSession.user.id).then(latestRole => {
                   if (latestRole && latestRole !== manualSession.role) {
                       // Update localStorage if changed
                       localStorage.setItem('manual-session', JSON.stringify({ ...manualSession, role: latestRole }));
                   }
               });
           }
        }
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        fetchUserRole(session.user.id);
      } else {
        const manualSessionStr = localStorage.getItem('manual-session');
        if (!manualSessionStr) {
           setUser(null);
           setRole(null);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
         assignRoleFallback();
         return null;
      } else {
         setRole(data.role);
         return data.role;
      }
    } catch (err) {
      console.warn("Could not fetch user role.", err);
      assignRoleFallback();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const assignRoleFallback = () => {
      const e = user?.email?.toLowerCase() || '';
      if (e.includes('admin')) setRole('super_admin');
      else if (e.includes('manager')) setRole('manager');
      else if (e.includes('director')) setRole('director');
      else if (e.includes('qc')) setRole('qc');
      else if (e.includes('accountant')) setRole('accountant');
      else setRole('director'); // default read-only
  };

  const handleManualDBLogin = async (email, password) => {
      try {
         const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

         if (!error && data) {
            const mockUser = { id: data.id, email: data.email, user_metadata: { full_name: data.full_name } };
            setUser(mockUser);
            setRole(data.role);
            setError(null);
            localStorage.setItem('manual-session', JSON.stringify({ user: mockUser, role: data.role }));
            return { data: mockUser, error: null };
         }
      } catch (e) {
         console.warn("Manual DB login error:", e);
      }
      return null;
  };

  const handleMockLogin = (email, password) => {
      // Mock logins removed for production
      return null;
  };

  const login = async ({ email, password }) => {
    setError(null);
    try {
      // 1. Try Supabase Native Auth
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // 2. Try Manual Profiles DB check
        const manualResult = await handleManualDBLogin(email, password);
        if (manualResult) return manualResult;

        // 3. Try Hardcoded Mock Fallbacks
        const mockResult = handleMockLogin(email, password);
        if (mockResult) return mockResult;
        
        setError(error.message);
      }
    } catch (err) {
      // If network fails or everything fails
      const manualResult = await handleManualDBLogin(email, password);
      if (manualResult) return manualResult;

      const mockResult = handleMockLogin(email, password);
      if (mockResult) return mockResult;

      setError("Connection failed. Please check your credentials.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    localStorage.removeItem('manual-session');
  };

  return (
    <AuthContext.Provider value={{ user, role, session, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
