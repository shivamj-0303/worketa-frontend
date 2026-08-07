import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

/**
 * ProtectedRoute: Guards routes that require authentication
 *
 * CRITICAL: Waits for auth hydration (isLoading=false) before checking isAuthenticated
 * This prevents the race condition where user gets redirected before session is restored
 */
export default function ProtectedRoute({
  isAuthenticated,
  isLoading,
  children,
}: ProtectedRouteProps) {
  // Wait for auth hydration to complete (restore from localStorage)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Restoring session...</p>
        </div>
      </div>
    );
  }

  // After auth hydration, check if authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
