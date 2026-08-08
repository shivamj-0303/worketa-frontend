import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  getToken?: () => string | null;
  onTokenRefresh?: (newToken: string) => Promise<void>;
  onUnauthorized?: () => void;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Production-grade API client for WORKETA
 *
 * Features:
 * - Token injection and refresh
 * - Request/response interceptors
 * - Proper error handling
 * - Multi-tenant support (organisation context)
 * - Retry logic
 */
export class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private isRefreshing = false;
  private failedQueue: ((token: string) => void)[] = [];

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: Add auth token
    this.client.interceptors.request.use((config) => {
      const token = this.config.getToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracing
      config.headers['X-Request-ID'] = this.generateRequestId();

      return config;
    });

    // Response interceptor: Handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Token refresh in progress, queue this request
            return new Promise((resolve) => {
              this.failedQueue.push((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          this.isRefreshing = true;
          originalRequest._retry = true;

          try {
            // Attempt token refresh using RELATIVE path (not absolute)
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.client.post<
              ApiResponse<{ accessToken: string; refreshToken: string }>
            >('/v1/auth/refresh', { refreshToken });

            // Check if refresh was successful
            if (
              'success' in response.data &&
              response.data.success &&
              response.data.data?.accessToken
            ) {
              const { accessToken, refreshToken: newRefreshToken } = response.data.data;

              // Update both tokens in localStorage
              localStorage.setItem('accessToken', accessToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }

              // Notify auth context of token update
              await this.config.onTokenRefresh?.(accessToken);

              // Retry failed queue
              this.failedQueue.forEach((callback) => {
                callback(accessToken);
              });
              this.failedQueue = [];

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            } else {
              throw new Error('Invalid refresh response');
            }
          } catch (err) {
            // Refresh failed, logout user
            this.config.onUnauthorized?.();
            return Promise.reject(err);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiErrorResponse {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ApiErrorResponse | undefined;

      if (response) {
        return response;
      }

      return {
        success: false,
        message: error.message || 'An error occurred',
        code: error.code,
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

export default ApiClient;
