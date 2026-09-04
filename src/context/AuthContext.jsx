import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [werkstatt, setWerkstatt] = useState(null);
  const [superadmin, setSuperadmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wToken = localStorage.getItem('werkstatt_token');
    const wData = localStorage.getItem('werkstatt_data');
    if (wToken && wData) {
      try { setWerkstatt(JSON.parse(wData)); } catch {
        localStorage.removeItem('werkstatt_token');
        localStorage.removeItem('werkstatt_data');
      }
    }
    const sToken = localStorage.getItem('superadmin_token');
    const sData = localStorage.getItem('superadmin_data');
    if (sToken && sData) {
      try { setSuperadmin(JSON.parse(sData)); } catch {
        localStorage.removeItem('superadmin_token');
        localStorage.removeItem('superadmin_data');
      }
    }
    setLoading(false);
  }, []);

  // ---------- Werkstatt ----------
  const loginWerkstatt = async (email, password) => {
    const { data } = await api.post('/auth/werkstatt/login', { email, password });
    localStorage.setItem('werkstatt_token', data.token);
    localStorage.setItem('werkstatt_data', JSON.stringify(data.werkstatt));
    setWerkstatt(data.werkstatt);
    return data.werkstatt;
  };

  const registerWerkstatt = async (formData) => {
    const { data } = await api.post('/auth/werkstatt/register', formData);
    localStorage.setItem('werkstatt_token', data.token);
    localStorage.setItem('werkstatt_data', JSON.stringify(data.werkstatt));
    setWerkstatt(data.werkstatt);
    return data.werkstatt;
  };

  const logoutWerkstatt = () => {
    localStorage.removeItem('werkstatt_token');
    localStorage.removeItem('werkstatt_data');
    setWerkstatt(null);
  };

  const refreshWerkstatt = async () => {
    const { data } = await api.get('/werkstaette/me');
    const updated = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: 'werkstatt',
      isApproved: data.isApproved,
      onboardingCompleted: data.onboardingCompleted,
    };
    localStorage.setItem('werkstatt_data', JSON.stringify(updated));
    setWerkstatt(updated);
    return data;
  };

  // ---------- SuperAdmin ----------
  const loginSuperAdmin = async (email, password) => {
    const { data } = await api.post('/auth/superadmin/login', { email, password });
    localStorage.setItem('superadmin_token', data.token);
    localStorage.setItem('superadmin_data', JSON.stringify(data.admin));
    setSuperadmin(data.admin);
    return data.admin;
  };

  const logoutSuperAdmin = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_data');
    setSuperadmin(null);
  };

  return (
    <AuthContext.Provider value={{
      werkstatt, superadmin, loading,
      loginWerkstatt, registerWerkstatt, logoutWerkstatt, refreshWerkstatt,
      loginSuperAdmin, logoutSuperAdmin,
      login: loginWerkstatt,
      logout: logoutWerkstatt,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı.');
  return ctx;
}