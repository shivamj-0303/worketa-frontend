import React, { ReactNode } from 'react';
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
export declare function AuthProvider({
  children,
}: AuthProviderProps): import('react/jsx-runtime').JSX.Element;
/**
 * useAuth: Hook to access authentication state and methods
 *
 * Usage:
 * const { user, isAuthenticated, logout } = useAuth();
 */
export declare function useAuth(): AuthContextType;
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
export declare function useAuthGuard(redirectTo?: string): {
  isAuthenticated: boolean;
  isLoading: boolean;
};
/**
 * withAuth: HOC to wrap components that require authentication
 *
 * Usage:
 * export default withAuth(Dashboard, '/login');
 */
export declare function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
): (props: P) => import('react/jsx-runtime').JSX.Element | null;
/**
 * useIsAdmin: Check if user has admin role
 */
export declare function useIsAdmin(): boolean;
/**
 * useIsManager: Check if user has manager role
 */
export declare function useIsManager(): boolean;
/**
 * useHasRole: Check if user has specific role(s)
 */
export declare function useHasRole(roles: string[]): boolean;
export {};
//# sourceMappingURL=context.d.ts.map
