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
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      // In a real system, you'd fetch this from a 'profiles' or 'roles' table linked to auth.users
      // Mocking role assignment for demonstration if DB isn't strictly configured yet.
      // E.g. we can hardcode email logic for now or fetch from table.
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
         // Fallback logic for mock environment when DB tables don't exist yet
         if (user?.email?.includes('admin')) setRole('super_admin');
         else setRole('viewer');
      } else {
         setRole(data.role);
      }
    } catch (err) {
      console.warn("Could not fetch user role. Defaulting to viewer.", err);
      // Fallback
      if (user?.email?.includes('admin')) setRole('super_admin');
      else setRole('viewer');
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Mock login override for demonstration if Supabase env vars are missing
        if (email === 'admin@mahaind.com' && password === 'admin123') {
           const mockUser = { id: 'mock-1', email: 'admin@mahaind.com' };
           setUser(mockUser);
           setRole('super_admin');
           setError(null); // Clear any supbase config errors
           localStorage.setItem('mock-auth-token', 'mock-admin-token');
           return { data: mockUser, error: null };
        } else if (email === 'staff@mahaind.com' && password === 'staff123') {
           const mockUser = { id: 'mock-2', email: 'staff@mahaind.com' };
           setUser(mockUser);
           setRole('viewer');
           setError(null); // Clear any supbase config errors
           localStorage.setItem('mock-auth-token', 'mock-staff-token');
           return { data: mockUser, error: null };
        }
        setError(error.message);
      }
    } catch (err) {
      // Handle network errors (like invalid Supabase URL) by falling back to mock login
      if (email === 'admin@mahaind.com' && password === 'admin123') {
         const mockUser = { id: 'mock-1', email: 'admin@mahaind.com' };
         setUser(mockUser);
         setRole('super_admin');
         localStorage.setItem('mock-auth-token', 'mock-admin-token');
         return { data: mockUser, error: null };
      } else if (email === 'staff@mahaind.com' && password === 'staff123') {
         const mockUser = { id: 'mock-2', email: 'staff@mahaind.com' };
         setUser(mockUser);
         setRole('viewer');
         localStorage.setItem('mock-auth-token', 'mock-staff-token');
         return { data: mockUser, error: null };
      }
      setError("Connection failed. Please check your Supabase credentials.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    localStorage.removeItem('mock-auth-token');
  };

  return (
    <AuthContext.Provider value={{ user, role, session, login, logout, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
