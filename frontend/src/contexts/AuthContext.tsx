import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType, User } from '../types';
import apiService from '../services/api';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        const token = apiService.getToken();
        const storedUser = localStorage.getItem('warung-user');
        let parsedUser: User | null = null;

        if (!token) {
          apiService.clearAuth();
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
          return;
        }

        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
            if (isMounted) {
              setUser(parsedUser);
              setIsAuthenticated(true);
            }
          } catch (parseError) {
            apiService.clearAuth();
            if (isMounted) {
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }

        const validationResult = await apiService.validateToken();

        if (!isMounted) {
          return;
        }

        if (validationResult.valid) {
          const latestUser = validationResult.user || parsedUser;

          if (latestUser) {
            setUser(latestUser);
            setIsAuthenticated(true);
            localStorage.setItem('warung-user', JSON.stringify(latestUser));
          } else {
            apiService.clearAuth();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else if (validationResult.shouldClear || validationResult.reason === 'expired') {
          apiService.clearAuth();
          setUser(null);
          setIsAuthenticated(false);
        } else if (validationResult.reason === 'no_token') {
          setUser(null);
          setIsAuthenticated(false);
        } else if (validationResult.reason === 'endpoint_missing') {
          if (parsedUser) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else if (validationResult.reason === 'network_error') {
          if (parsedUser) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          apiService.clearAuth();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {

        apiService.clearAuth();
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isInitializing) {
      return;
    }
  }, [isAuthenticated, isInitializing]);

  useEffect(() => {
    const handleUnauthorized = () => {
      apiService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [user, isAuthenticated]);

  const login = async (username: string, password: string): Promise<User | null> => {
    try {
      if (!username?.trim() || !password?.trim()) {
        throw new Error('Username dan password harus diisi');
      }
      const response = await apiService.login({ username: username.trim(), password });
      let user = null;
      const anyResponse = response as any;
      if (response.user && response.token) {
        user = response.user;
      } else if (anyResponse.data?.user && anyResponse.data?.token) {
        user = anyResponse.data.user;
      } else if (anyResponse.success && anyResponse.data?.user) {
        user = anyResponse.data.user;
      } else if (anyResponse.user && anyResponse.access_token) {
        user = anyResponse.user;
      } else if (anyResponse.id && anyResponse.name) {
        user = anyResponse;
      }
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        return user;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        throw new Error('Username atau password salah');
      }
    } catch (error: any) {
      setUser(null);
      setIsAuthenticated(false);
      const status = error?.response?.status;
      if (status === 400 || status === 401 || status === 422) {
        throw new Error('Username Atau Password Yang Salah');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Username atau password salah');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading: isInitializing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};