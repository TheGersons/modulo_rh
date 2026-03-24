import { createContext, useContext, useState, type ReactNode, useEffect, useRef } from 'react';
import apiClient from '../services/api.service';

interface User {
  id: string;
  email: string;
  role: string;
  nombre: string;
  apellido?: string;
  areaId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshIntervalRef = useRef<number | null>(null); // ← CAMBIAR de NodeJS.Timeout a number

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const savedUser = localStorage.getItem('user');

    if (accessToken && refreshToken && savedUser) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setupTokenRefresh();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const setupTokenRefresh = () => {
    // Refrescar token cada 12 minutos (antes de que expire a los 15)
    refreshIntervalRef.current = window.setInterval(async () => { // ← CAMBIAR setInterval a window.setInterval
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Error al refrescar token:', error);
        logout();
      }
    }, 12 * 60 * 1000); // 12 minutos
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await apiClient.post('/auth/refresh', { refreshToken });

    if (response.data.success && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken); // ← agregar
      }
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
    } else {
      throw new Error('Failed to refresh token');
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });

    if (response.data.success && response.data.accessToken) {
      const { accessToken, refreshToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      setUser(userData);
      setIsAuthenticated(true);
      setupTokenRefresh();
    } else {
      throw new Error(response.data.message || 'Error en el login');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}