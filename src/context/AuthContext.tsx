import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService, LoginRequest } from '../services/authService';
import {
  USER_SESSION_KEY,
  getStoredAuthToken,
  setStoredAuthToken,
  setStoredRefreshToken,
} from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    setStoredAuthToken(null);
    setStoredRefreshToken(null);
    localStorage.removeItem(USER_SESSION_KEY);
    setUser(null);
    setToken(null);
  };

  // Inicializa sessão a partir do armazenamento local
  useEffect(() => {
    try {
      const storedToken = getStoredAuthToken();
      const storedUserJson = localStorage.getItem(USER_SESSION_KEY);

      if (storedToken && storedUserJson) {
        const parsedUser = JSON.parse(storedUserJson);
        setUser(parsedUser);
        setToken(storedToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Erro ao carregar sessão:', err);
    } finally {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      clearSession();
    };

    window.addEventListener('maisvet:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('maisvet:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginRequest): Promise<User> => {
    const response = await authService.login(credentials);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(response.user));
    return response.user;
  };

  const logout = () => {
    void authService.logout();
    clearSession();
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((current) => {
      if (!current) return current;

      const nextUser = { ...current, ...updates };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
