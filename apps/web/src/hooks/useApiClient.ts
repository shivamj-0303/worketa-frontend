import { useAuth } from '@worketa/auth';
import { ApiClient } from '@worketa/api';

/**
 * Global API client instance configured with auth interceptors
 * This ensures all API calls have proper token handling and refresh logic
 *
 * Token Storage Standard:
 * - accessToken: JWT access token (short-lived)
 * - refreshToken: Refresh token (long-lived)
 */
let globalApiClient: ApiClient | null = null;

/**
 * Hook to get the globally configured API client
 * Automatically sets up token refresh callbacks
 */
export function useApiClient(): ApiClient {
  const { logout, setToken } = useAuth();

  if (!globalApiClient) {
    globalApiClient = new ApiClient({
      baseURL: '/api',
      timeout: 30000,
      getToken: () => localStorage.getItem('accessToken'),
      onTokenRefresh: async (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('accessToken', newToken);
      },
      onUnauthorized: () => {
        logout();
      },
    });
  }

  return globalApiClient;
}

/**
 * Get the API client without React hooks (for use in non-component contexts)
 */
export function getApiClient(): ApiClient {
  if (!globalApiClient) {
    globalApiClient = new ApiClient({
      baseURL: '/api',
      timeout: 30000,
      // Read access token for API requests
      getToken: () => localStorage.getItem('accessToken'),
      // Called when token is refreshed (store new token)
      onTokenRefresh: async (newToken: string) => {
        localStorage.setItem('accessToken', newToken);
      },
      // Called when unauthorized - logout user
      onUnauthorized: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
      },
    });
  }
  return globalApiClient;
}
