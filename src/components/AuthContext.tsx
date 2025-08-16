import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { AuthUser, AuthenticationResponse, RegisterRequest } from '../types/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          // Check if the token is valid by making a test request
          // Since we don't have a user profile endpoint, we'll just check if we can access protected resources
          try {
            // Try to fetch drafts as a way to validate the token
            await apiService.getDrafts();
            setIsAuthenticated(true);
            // For now, we'll create a mock user since backend doesn't have user profile endpoint
            // You should add a user profile endpoint to your backend
            setUser({
              id: 'current-user-id',
              name: 'Current User',
              email: 'user@example.com'
            });
          } catch (error) {
            // Token is invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenType');
            localStorage.removeItem('expiresIn');
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      await apiService.login({ email, password });
      
      setIsAuthenticated(true);
      
      // Since we don't have a user profile endpoint, create a mock user
      // TODO: Add getUserProfile() endpoint to your backend and call it here
      setUser({
        id: 'current-user-id',
        name: 'Current User',
        email: email
      });

      // Tokens are already stored in the apiService.login method
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, we should clear local state
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);
  
  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
  try {
    await apiService.register(userData);
    
    setIsAuthenticated(true);
    
    // Create user object from registration data
    setUser({
      id: 'current-user-id', // This will be replaced when we add user profile endpoint
      name: userData.name,
      email: userData.email
    });

  } catch (error) {
    setIsAuthenticated(false);
    setUser(null);
    throw error;
  }
}, []);

const value: AuthContextType = {
  isAuthenticated,
  user,
  login,
  register,
  logout,
  loading
};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;