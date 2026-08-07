# @worketa/auth

Authentication context and hooks for WORKETA applications. Provides session management, token storage, and role-based access control.

## Features

✅ **Authentication Context**

- AuthProvider wraps entire app
- useAuth hook for all components
- Token persistence across page reloads
- User session management

✅ **Token Management**

- Secure token storage (localStorage)
- Configurable storage key
- Token-based authentication
- Automatic token retrieval

✅ **Role-Based Access Control**

- Check user role (admin, manager, driver, employee)
- useIsAdmin, useIsManager hooks
- useHasRole for custom role checking
- Declarative route protection

✅ **Route Protection**

- withAuth HOC for components
- useAuthGuard hook for manual control
- Automatic redirect to login
- Protected component rendering

✅ **Session Persistence**

- Automatic session restoration on app load
- LocalStorage-backed persistence
- Configurable storage key
- Graceful fallback on corrupted data

## Installation

```bash
# Via pnpm (from root)
pnpm install

# The package is already configured in the monorepo
```

## Quick Start

### 1. Wrap App with AuthProvider

```typescript
// src/main.tsx
import { AuthProvider } from '@worketa/auth';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
```

### 2. Use in Components

```typescript
import { useAuth } from '@worketa/auth';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header>
      <span>Welcome, {user?.firstName}</span>
      <button onClick={() => logout()}>Logout</button>
    </header>
  );
}
```

### 3. Protect Routes

```typescript
import { withAuth, ProtectedRoute } from '@worketa/auth';

// Option 1: Using HOC
const Dashboard = withAuth(() => (
  <div>Dashboard</div>
), '/login');

// Option 2: Using React Router
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// Option 3: Using hook
export function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuthGuard('/login');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <Dashboard />;
}
```

## API Reference

### AuthProvider

Wraps your entire app to provide authentication context.

```typescript
interface AuthProviderProps {
  children: ReactNode;
  storageKey?: string;  // Default: 'authToken'
}

<AuthProvider storageKey="worketa:token">
  <App />
</AuthProvider>
```

### useAuth Hook

Access authentication state and methods in any component.

```typescript
const {
  user, // Current authenticated user or null
  token, // JWT token or null
  isAuthenticated, // Boolean
  isLoading, // Boolean (true on mount while restoring session)
  login, // (user, token) => void
  logout, // () => void
  setToken, // (token) => void
  updateUser, // (updates) => void
} = useAuth();

// Usage
if (useAuth().isAuthenticated) {
  console.log('User:', useAuth().user);
}
```

### useAuthGuard Hook

Ensure component is only rendered when authenticated. Automatically redirects if not.

```typescript
const { isAuthenticated, isLoading } = useAuthGuard(
  '/login'  // Redirect path
);

// Component won't render until authenticated
if (isLoading) return <Spinner />;
if (!isAuthenticated) return null;  // useAuthGuard already redirected

return <Dashboard />;
```

### withAuth HOC

Wrap components that require authentication.

```typescript
const ProtectedDashboard = withAuth(
  Dashboard,        // Component to protect
  '/login'          // Redirect path
);

// Usage in routes
<Route path="/dashboard" element={<ProtectedDashboard />} />
```

### Role Checking Hooks

```typescript
const isAdmin = useIsAdmin(); // Checks role === 'ADMIN'
const isManager = useIsManager(); // Checks role === 'MANAGER' || 'ADMIN'
const hasRole = useHasRole(['ADMIN', 'MANAGER']); // Check specific roles
```

## Common Patterns

### Login Form

```typescript
import { useAuth } from '@worketa/auth';
import { useLogin } from '@worketa/api';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: (response) => {
          // Save to auth context
          login(response.data.user, response.data.token);

          // Redirect to dashboard
          navigate('/dashboard');
        },
        onError: (error) => {
          // Show error message
          setError(error.message);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Role-Based Navigation

```typescript
import { useAuth } from '@worketa/auth';

export function Navigation() {
  const { isAdmin, isManager } = useAuth();

  return (
    <nav>
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/employees">Employees</NavLink>

      {isManager && (
        <>
          <NavLink to="/payroll">Payroll</NavLink>
          <NavLink to="/reports">Reports</NavLink>
        </>
      )}

      {isAdmin && (
        <NavLink to="/settings">Settings</NavLink>
      )}
    </nav>
  );
}
```

### Protected Routes

```typescript
import { Routes, Route } from 'react-router-dom';
import { withAuth } from '@worketa/auth';

const Dashboard = withAuth(() => <div>Dashboard</div>);
const Employees = withAuth(() => <div>Employees</div>);
const Payroll = withAuth(() => <div>Payroll</div>);

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/payroll" element={<Payroll />} />
    </Routes>
  );
}
```

### User Menu

```typescript
import { useAuth } from '@worketa/auth';

export function UserMenu() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2">
        <span>{user?.firstName}</span>
        <ChevronDown size={16} />
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block">
        <a href="/profile" className="block px-4 py-2">Profile</a>
        <a href="/settings" className="block px-4 py-2">Settings</a>
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
```

## Advanced Usage

### Custom Token Storage

For more secure storage, implement a custom storage backend:

```typescript
const customStorage = {
  getToken: () => {
    // Get from secure storage (e.g., secure cookies)
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1];
  },
  setToken: (token: string) => {
    // Set secure, httpOnly cookie
    document.cookie = `authToken=${token}; Secure; HttpOnly; SameSite=Strict`;
  },
  clearToken: () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  },
};

// Use in setup
apiClient.setToken = customStorage.setToken;
// Update useAuth to use customStorage instead of localStorage
```

### Session Timeout

```typescript
import { useAuth } from '@worketa/auth';
import { useEffect } from 'react';

export function SessionTimeout() {
  const { logout } = useAuth();
  const TIMEOUT = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        window.location.href = '/login?timeout=1';
      }, TIMEOUT);
    };

    // Reset timeout on user activity
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keypress', resetTimeout);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
    };
  }, [logout]);

  return null;
}
```

### Update User Profile

```typescript
import { useAuth } from '@worketa/auth';

export function ProfileSettings() {
  const { user, updateUser } = useAuth();

  const handleSave = (firstName: string) => {
    // Update backend
    updateUserAPI(firstName);

    // Update local auth context
    updateUser({ firstName });
  };

  return (
    <input
      defaultValue={user?.firstName}
      onBlur={(e) => handleSave(e.target.value)}
    />
  );
}
```

## Troubleshooting

### "useAuth must be used within AuthProvider"

- Ensure AuthProvider wraps your entire app
- Check AuthProvider is not inside a component that conditionally renders

### User state not persisting

- Check localStorage is enabled
- Verify `storageKey` prop is consistent
- Check browser console for errors

### Token not being sent to API

- Ensure ApiClient `getToken()` is configured
- Check token is being set after login
- Verify token format (should start with "eyJ...")

### Logout not redirecting

- Implement manual redirect in logout callback
- Check route guards are set up correctly
- Verify onUnauthorized() callback is configured in ApiClient

## Security Best Practices

1. **Never store sensitive data in localStorage**
   - Tokens are OK (they're JWT)
   - Never store passwords
   - Never store PII

2. **Use HTTPS in production**
   - Prevents token interception
   - Required for secure cookies

3. **Implement token refresh**
   - ApiClient already handles this
   - Tokens should expire in 15-30 minutes
   - Refresh tokens should be httpOnly cookies

4. **Validate on backend**
   - Frontend auth is for UX only
   - Always validate token on backend
   - Check permissions server-side

5. **Handle logout properly**
   - Invalidate token on server
   - Clear all local data
   - Redirect to login page

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@worketa/auth';

it('shows login page when not authenticated', () => {
  render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );

  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

it('shows user menu when authenticated', () => {
  // Mock auth context with authenticated user
  const mockUser = { id: '1', firstName: 'John', role: 'ADMIN' };

  render(
    <AuthProvider>
      <UserMenu />
    </AuthProvider>
  );

  expect(screen.getByText('John')).toBeInTheDocument();
});
```

## License

WORKETA © 2024 All Rights Reserved
