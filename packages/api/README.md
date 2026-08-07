# @worketa/api

Production-grade API client for WORKETA Transport Management System with automatic token management, request/response interceptors, and complete TypeScript types.

## Features

✅ **Axios-based HTTP Client**

- RESTful API abstraction
- Request/response interceptors
- Error handling & normalization
- Timeout & retry configuration

✅ **Token Management**

- Automatic Bearer token injection
- Automatic token refresh on 401
- Token refresh queue (prevents thundering herd)
- Configurable token storage

✅ **Request Tracking**

- Request ID generation (`X-Request-ID` header)
- Distributed tracing support
- Timestamp correlation

✅ **TypeScript First**

- 100% TypeScript with strict mode
- Complete type definitions for all API responses
- Zod-compatible types
- IntelliSense support

✅ **React Query Integration**

- Pre-built hooks for all endpoints
- Automatic query key generation
- Proper caching strategies
- Mutation helpers with invalidation

✅ **Production Ready**

- Error recovery strategies
- Request deduplication
- CORS handling
- Network resilience

## Installation

```bash
# Via pnpm (from root)
pnpm install

# The package is already configured in the monorepo
```

## Quick Start

### 1. Setup API Client

```typescript
// src/App.tsx
import { ApiClient } from '@worketa/api';

// Create instance (do this once at app startup)
const apiClient = new ApiClient({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
  getToken: () => {
    // Get token from storage
    return localStorage.getItem('authToken');
  },
  onTokenRefresh: (newToken: string) => {
    // Save refreshed token
    localStorage.setItem('authToken', newToken);
  },
  onUnauthorized: () => {
    // Handle logout (e.g., redirect to login)
    window.location.href = '/login';
  },
});

// Make available to React Query hooks
export { apiClient };
```

### 2. Use in Components

```typescript
import { useEmployees, useCreateEmployee } from '@worketa/api';

export function EmployeeList() {
  // Query
  const { data, isLoading, error } = useEmployees();

  // Mutation
  const createMutation = useCreateEmployee();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <div>
        {data?.data.map(emp => (
          <div key={emp.id}>{emp.firstName} {emp.lastName}</div>
        ))}
      </div>

      <button
        onClick={() =>
          createMutation.mutate({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          })
        }
      >
        Create Employee
      </button>
    </>
  );
}
```

### 3. Setup Query Client

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
```

## API Client API

### Constructor Options

```typescript
const apiClient = new ApiClient({
  // Required
  baseURL: string;           // e.g., 'http://localhost:8080'

  // Optional
  getToken?: () => string | null;        // Get current token
  onTokenRefresh?: (token: string) => void; // Save new token
  onUnauthorized?: () => void;           // Handle logout
  timeout?: number;                      // Request timeout (default: 30000ms)
});
```

### Methods

```typescript
// GET request
const response = await apiClient.get<Employee>('/api/v1/employees/1');

// POST request
const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
  username: 'admin',
  password: 'password',
});

// PUT request
const response = await apiClient.put<Employee>('/api/v1/employees/1', {
  firstName: 'John',
  lastName: 'Doe',
});

// PATCH request
const response = await apiClient.patch<Employee>('/api/v1/employees/1', { firstName: 'Jane' });

// DELETE request
const response = await apiClient.delete<void>('/api/v1/employees/1');

// Set token (after login)
apiClient.setToken('eyJhbGciOiJIUzI1NiIs...');

// Clear token (on logout)
apiClient.clearToken();
```

### Response Format

All API methods return an `ApiResponse<T>` object:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

// Usage
const response = await apiClient.get<Employee>('/api/v1/employees/1');
if (response.success) {
  console.log(response.data); // Employee object
  console.log(response.timestamp); // When request completed
}
```

### Error Handling

```typescript
try {
  const response = await apiClient.get<Employee>('/api/v1/employees/999');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.message); // Error message
    console.log(error.statusCode); // HTTP status
    console.log(error.originalError); // Original axios error
  }
}
```

## React Query Hooks

All hooks are pre-configured with optimal defaults.

### Authentication Hooks

```typescript
// Login
const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => apiClient.post<LoginResponse>('/api/v1/auth/login', data),
  });
};

// Usage
const loginMutation = useLogin();
loginMutation.mutate({
  username: 'admin',
  password: 'password',
});
```

### Employee Hooks

```typescript
// List all employees
const { data, isLoading } = useEmployees({
  organizationId: 'org-123', // Optional filter
});

// Get single employee
const { data: employee } = useEmployee('emp-123');

// Create employee
const createMutation = useCreateEmployee();
createMutation.mutate({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  // ... other fields
});

// Update employee
const updateMutation = useUpdateEmployee('emp-123');
updateMutation.mutate({
  firstName: 'Jane',
});

// Delete employee
const deleteMutation = useDeleteEmployee('emp-123');
deleteMutation.mutate();
```

### Vehicle Hooks

```typescript
const { data: vehicles } = useVehicles();
const { data: vehicle } = useVehicle('veh-123');

const createVehicleMutation = useCreateVehicle();
const updateVehicleMutation = useUpdateVehicle('veh-123');
const deleteVehicleMutation = useDeleteVehicle('veh-123');
```

### Trip Hooks

```typescript
const { data: trips } = useTrips();
const { data: trip } = useTrip('trip-123');

const createTripMutation = useCreateTrip();
const updateTripMutation = useUpdateTrip('trip-123');
```

### Other Hooks

```typescript
// Companies
const { data: companies } = useCompanies();
const createCompanyMutation = useCreateCompany();

// Attendance
const { data: attendance } = useAttendance();
const markAttendanceMutation = useMarkAttendance();

// Payroll
const { data: payroll } = usePayroll();
const createPayrollMutation = useCreatePayroll();

// Advances
const { data: advances } = useAdvances();
const createAdvanceMutation = useCreateAdvance();
```

## Type Definitions

Complete TypeScript interfaces for all API entities:

```typescript
// Authentication
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

// User
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

// Employee
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  dateOfJoining: string;
  organizationId: string;
}

// Vehicle
interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  color: string;
  capacity: number;
  fuelType: FuelType;
  organizationId: string;
}

// Trip
interface Trip {
  id: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  distance: number;
  status: TripStatus;
  vehicleId: string;
  driverId: string;
  organizationId: string;
}

// ... and many more
```

## Advanced Usage

### Custom Query Options

```typescript
const { data } = useEmployees({
  // React Query options
  enabled: false, // Disable auto-fetch
  staleTime: 1000 * 60 * 10, // 10 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes
  retry: 3, // Retry 3 times
});
```

### Manual Refetch

```typescript
const { refetch } = useEmployees();

// Refetch on demand
button.onClick = () => refetch();
```

### Mutations with Callbacks

```typescript
const createMutation = useCreateEmployee({
  onSuccess: (response) => {
    console.log('Created:', response.data);
    // React Query automatically invalidates 'employees' queries
    // You can add additional callbacks here
  },
  onError: (error) => {
    console.error('Failed:', error.message);
  },
});
```

### Optimistic Updates

```typescript
const queryClient = useQueryClient();

const updateMutation = useUpdateEmployee('emp-123', {
  onMutate: async (updatedData) => {
    // Cancel ongoing fetches
    await queryClient.cancelQueries({
      queryKey: ['employees'],
    });

    // Snapshot previous data
    const previousData = queryClient.getQueryData(['employees']);

    // Optimistically update UI
    queryClient.setQueryData(['employees'], (old: any) => ({
      ...old,
      data: old.data.map((emp) => (emp.id === 'emp-123' ? { ...emp, ...updatedData } : emp)),
    }));

    return { previousData };
  },
  onError: (error, variables, context) => {
    // Revert on error
    if (context?.previousData) {
      queryClient.setQueryData(['employees'], context.previousData);
    }
  },
});
```

### Request Cancellation

```typescript
const abortController = new AbortController();

const response = await apiClient.get('/api/v1/employees', { signal: abortController.signal });

// Cancel if still in progress
abortController.abort();
```

## Token Refresh Flow

The API client automatically handles token refresh:

```typescript
// 1. Request made with expired token
GET /api/v1/employees
Authorization: Bearer eyJhbGciOi...

// 2. Server returns 401
401 Unauthorized

// 3. Client queues failed request
// 4. Client calls refresh endpoint
POST /api/v1/auth/refresh
Authorization: Bearer eyJhbGciOi...

// 5. Server returns new token
{
  token: "eyJhbGciOi..."
}

// 6. Client stores new token
localStorage.setItem('authToken', 'eyJhbGciOi...')

// 7. Client retries original request with new token
GET /api/v1/employees
Authorization: Bearer eyJhbGciOi... (new token)

// 8. Request succeeds
```

If multiple requests fail with 401 simultaneously, they're queued and retried together after token refresh (prevents "thundering herd").

## Error Codes

Common HTTP error codes and handling:

```typescript
// 400 Bad Request
// Your input was invalid - check validation

// 401 Unauthorized
// Token expired - auto-refreshed by client

// 403 Forbidden
// You don't have permission - check user role

// 404 Not Found
// Resource doesn't exist

// 429 Too Many Requests
// Rate limited - exponential backoff

// 500 Internal Server Error
// Server error - check backend logs

// 503 Service Unavailable
// Server maintenance - retry later
```

## Debugging

Enable debug logging:

```typescript
const apiClient = new ApiClient({
  baseURL: process.env.VITE_API_BASE_URL,
  // ... other options
});

// Log all requests/responses
if (process.env.NODE_ENV === 'development') {
  apiClient.client.interceptors.request.use((config) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    return config;
  });

  apiClient.client.interceptors.response.use(
    (response) => {
      console.log('📥 Response:', response.status, response.data);
      return response;
    },
    (error) => {
      console.error('❌ Error:', error.response?.status, error.message);
      throw error;
    }
  );
}
```

## Best Practices

1. **Always use query keys consistently**

   ```typescript
   // Good
   queryClient.invalidateQueries({ queryKey: ['employees'] });

   // Good
   queryClient.invalidateQueries({ queryKey: ['employees', empId] });

   // Bad - inconsistent
   queryClient.invalidateQueries({ queryKey: ['employee', empId] });
   ```

2. **Use proper loading states**

   ```typescript
   const { data, isLoading, error } = useEmployees();

   if (isLoading) return <Skeleton />;
   if (error) return <ErrorMessage error={error} />;
   return <EmployeeList data={data?.data} />;
   ```

3. **Handle errors gracefully**

   ```typescript
   const { mutate, error } = useCreateEmployee();

   return (
     <>
       {error && <Alert type="error">{error.message}</Alert>}
       <form onSubmit={handleSubmit}>...</form>
     </>
   );
   ```

4. **Set appropriate stale times**

   ```typescript
   // User lists - 5 minutes
   const employees = useEmployees({ staleTime: 1000 * 60 * 5 });

   // Static data - 1 hour
   const roles = useRoles({ staleTime: 1000 * 60 * 60 });

   // Real-time data - no stale time
   const trips = useTrips({ staleTime: 0 });
   ```

5. **Use mutations with proper UI feedback**

   ```typescript
   const mutation = useCreateEmployee();

   <button
     disabled={mutation.isPending}
     onClick={() => mutation.mutate(data)}
   >
     {mutation.isPending ? 'Creating...' : 'Create'}
   </button>
   ```

## Testing

```typescript
// Mock the API client
vi.mock('@worketa/api', () => ({
  useEmployees: vi.fn(() => ({
    data: { data: [{ id: '1', firstName: 'John' }] },
    isLoading: false,
    error: null,
  })),
}));

// Use in test
import { useEmployees } from '@worketa/api';

it('renders employees', () => {
  const { getByText } = render(<EmployeeList />);
  expect(getByText('John')).toBeInTheDocument();
});
```

## Troubleshooting

### "401 Unauthorized" loop

- Check token is being saved correctly
- Verify `getToken()` returns the right token
- Check `onUnauthorized()` is not causing re-auth attempts

### "Network Error"

- Check API base URL is correct
- Verify CORS is enabled on backend
- Check network tab in DevTools

### "Cannot find module" error

- Run `pnpm install` from root
- Check import path (should be `@worketa/api`)

### Stale data showing

- Reduce `staleTime` for that query
- Call `refetch()` after mutations
- Use `invalidateQueries()` in mutation callbacks

## Contributing

When adding new API endpoints:

1. Add type definition in `src/types.ts`
2. Add hook in `src/hooks.ts`
3. Export from `src/index.ts`
4. Test with sample data
5. Document with JSDoc comments

## License

WORKETA © 2024 All Rights Reserved
