import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'EMPLOYEE';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider: Wraps your entire app to provide authentication context
 *
 * Token Storage Standard:
 * - accessToken: JWT access token (short-lived, 15 min)
 * - refreshToken: Refresh token (long-lived, 7 days)
 * - authUser: Current user object
 *
 * Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    // Use standardized token keys (unified across entire app)
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken) {
      setTokenState(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('authUser');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setTokenState(newToken);
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
  };

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    localStorage.setItem('accessToken', newToken);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    setToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth: Hook to access authentication state and methods
 *
 * Usage:
 * const { user, isAuthenticated, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * useAuthGuard: Hook that ensures user is authenticated
 * Redirects to login if not authenticated
 *
 * Usage:
 * export function ProtectedPage() {
 *   const { isAuthenticated } = useAuthGuard('/login');
 *   return <Dashboard />;
 * }
 */
export function useAuthGuard(redirectTo: string = '/login'): {
  isAuthenticated: boolean;
  isLoading: boolean;
} {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * withAuth: HOC to wrap components that require authentication
 *
 * Usage:
 * export default withAuth(Dashboard, '/login');
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/login'
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = redirectTo;
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * useIsAdmin: Check if user has admin role
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === 'ADMIN';
}

/**
 * useIsManager: Check if user has manager role
 */
export function useIsManager(): boolean {
  const { user } = useAuth();
  return user?.role === 'MANAGER' || user?.role === 'ADMIN';
}

/**
 * useHasRole: Check if user has specific role(s)
 */
export function useHasRole(roles: string[]): boolean {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
}
