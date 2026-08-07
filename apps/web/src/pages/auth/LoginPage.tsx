import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@worketa/auth';
import { useApiClient } from '@/hooks/useApiClient';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginInput = z.infer<typeof loginSchema>;

type LoginLocationState = {
  message?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const apiClient = useApiClient();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Display success message from registration
  useEffect(() => {
    const state = location.state as LoginLocationState | null;
    if (state?.message) {
      setSuccess(state.message);
      // Clear it after 5 seconds
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call backend with proper API client (has token interceptors)
      const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/v1/auth/login',
        {
          email: data.email,
          password: data.password,
        }
      );

      // Check if response is success
      if (response.success) {
        const { accessToken, refreshToken } = response.data;

        if (!accessToken) {
          setError('Login failed: No token received');
          return;
        }

        // Store tokens using standard keys (unified across app)
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Login with auth context (creates persistent session)
        login(
          {
            id: 'authenticated-user',
            firstName: 'User',
            lastName: '',
            email: data.email,
            role: 'EMPLOYEE',
          },
          accessToken
        );

        navigate('/dashboard');
      } else {
        setError('Invalid server response');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WORKETA</h1>
          <p className="text-gray-600">Fleet & Workforce Management</p>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-success-600 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <Link
            to="/forgot-password"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Forgot your password?
          </Link>

          <div className="text-gray-600 text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
