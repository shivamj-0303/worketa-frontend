/**
 * @worketa/auth - Authentication context and hooks
 *
 * This package provides authentication state management for the WORKETA app.
 *
 * Key exports:
 * - AuthProvider: Wrap your app with this to enable authentication
 * - useAuth: Hook to access auth state and methods
 * - withAuth: HOC to protect routes
 * - useAuthGuard: Hook to ensure authentication
 * - useIsAdmin, useIsManager, useHasRole: Role checking helpers
 */
export {
  AuthProvider,
  useAuth,
  useAuthGuard,
  withAuth,
  useIsAdmin,
  useIsManager,
  useHasRole,
} from './context';
export type { AuthContextType } from './context';
//# sourceMappingURL=index.d.ts.map
