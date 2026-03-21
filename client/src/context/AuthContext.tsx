import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import api from '../utils/api';

interface Tenant { id: string; name: string; slug: string; }

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (orgName: string, email: string, password: string, phone?: string, gstin?: string) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  const setAuth = (data: { accessToken: string; user: User; tenant: Tenant }) => {
    localStorage.setItem('accessToken', data.accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    setToken(data.accessToken);
    setUser(data.user);
    setTenant(data.tenant);
  };

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setTenant(null);
  };

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });
      localStorage.setItem('accessToken', data.accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      setToken(data.accessToken);
      return data.accessToken;
    } catch {
      clearAuth();
      return null;
    }
  }, []);

  // Axios interceptor — auto-refresh on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      r => r,
      async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
          original._retry = true;
          const newToken = await refreshToken();
          if (newToken) {
            original.headers['Authorization'] = `Bearer ${newToken}`;
            return api(original);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  useEffect(() => {
    const stored = localStorage.getItem('accessToken');
    if (stored) {
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
      api.get('/auth/profile')
        .then(r => { setUser(r.data); setTenant(r.data.tenant ?? null); })
        .catch(() => refreshToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password }, { withCredentials: true });
    setAuth(data);
  };

  const register = async (orgName: string, email: string, password: string, phone?: string, gstin?: string) => {
    const { data } = await api.post('/auth/register', { orgName, email, password, phone, gstin }, { withCredentials: true });
    setAuth(data);
    return { message: data.message };
  };

  const logout = async () => {
    try { await api.post('/auth/logout', {}, { withCredentials: true }); } catch { /* ignore */ }
    clearAuth();
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, tenant, token, login, register, logout, refreshToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
