import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@worketa/auth';
import { useApiClient } from '@/hooks/useApiClient';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const registerSchema = z
  .object({
    organisationName: z.string().min(1, 'Organisation name is required'),
    ownerName: z.string().min(1, 'Owner name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const apiClient = useApiClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Register the organization
      const registerResponse = await apiClient.post<{
        organisationId: string;
        userId: string;
        accessToken?: string;
        refreshToken?: string;
      }>('/v1/organisations/register', {
        name: data.organisationName,
        ownerName: data.ownerName,
        email: data.email,
        password: data.password,
      });

      if (!('success' in registerResponse && registerResponse.success)) {
        throw new Error('Registration failed');
      }

      // If backend returns tokens, auto-login the user
      if ('data' in registerResponse && registerResponse.data?.accessToken) {
        const { accessToken, refreshToken } = registerResponse.data;

        // Store tokens using standard keys
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Update auth context
        login(
          {
            id: registerResponse.data.userId || 'user-id',
            firstName: data.ownerName,
            lastName: '',
            email: data.email,
            role: 'ADMIN',
          },
          accessToken
        );

        // Go directly to dashboard
        navigate('/dashboard');
      } else {
        // Backend doesn't return tokens - redirect to login
        navigate('/login', {
          state: { message: 'Registration successful! Please sign in with your credentials.' },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WORKETA</h1>
          <p className="text-gray-600">Create Your Account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Organisation Name"
            placeholder="Acme Inc."
            {...register('organisationName')}
            error={errors.organisationName?.message}
          />

          <Input
            label="Owner Name"
            placeholder="John Doe"
            {...register('ownerName')}
            error={errors.ownerName?.message}
          />

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

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
