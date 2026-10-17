import {
  createContext,
  useState,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../types/auth';
import * as authService from '../services/auth.service';

export interface AuthContextData {
  user: Usuario | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const usuario = await authService.getMe();
      setUser(usuario);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      await refreshUser();
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (cpf: string, senha: string) => {
    const response = await authService.login(cpf, senha);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.usuario);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
