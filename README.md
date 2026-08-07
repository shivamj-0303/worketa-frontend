# WORKETA Frontend - Production-Grade Transport Management Dashboard

A complete, enterprise-level frontend ecosystem for the WORKETA Transport Management System. Built with React, React Native, and a shared monorepo architecture for maximum code reuse and maintainability.

## 🏗️ Architecture Overview

### Monorepo Structure

```
frontend/
├── packages/                 # Shared packages
│   ├── api/                 # Centralized API client
│   ├── auth/                # Authentication logic & context
│   ├── schemas/             # Zod validation schemas
│   └── ui/                  # Shared UI components
├── apps/
│   ├── web/                 # React + Vite web dashboard
│   └── android/             # React Native Android app
├── .github/workflows/       # CI/CD pipelines
└── docs/                    # Documentation

```

### Technology Stack

**Web Application:**

- React 19 + TypeScript 5.4
- Vite 5.1 (ESM-first bundler)
- TailwindCSS 3.4 (utility-first CSS)
- React Router 6.24 (client-side routing)
- Zustand (lightweight UI state)
- React Query v5 (server state & caching)
- React Hook Form + Zod (form validation)
- Framer Motion (animations)
- Axios (HTTP client)

**Android Application:**

- React Native + TypeScript 5.4
- React Navigation 6 (navigation framework)
- Zustand (state management)
- React Query v5 (server state)
- React Hook Form + Zod (forms)
- NativeWind (Tailwind for React Native)
- Axios (HTTP client)

**Shared Packages:**

- @worketa/api: Axios client with interceptors, token management, types, React Query hooks
- @worketa/auth: Authentication context, useAuth hook, session management
- @worketa/schemas: Zod validation schemas, constants, types
- @worketa/ui: Component library (shadcn/ui pattern)

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20.0.0
- pnpm ≥ 9.0.0 (monorepo package manager)

### Installation

```bash
# Install all dependencies
pnpm install

# Start web development server
pnpm dev:web

# Start Android development server (in new terminal)
pnpm dev:android

# Run linting & formatting
pnpm lint
pnpm format

# Type checking
pnpm type-check
```

### Environment Variables

**Web App (`apps/web/.env.local`):**

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=WORKETA
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG=false
```

**Android App (`apps/android/.env.local`):**

```env
EXPO_PUBLIC_API_BASE_URL=http://your-server.com
EXPO_PUBLIC_APP_NAME=WORKETA
EXPO_PUBLIC_ENABLE_DEBUG=false
```

## 📦 Shared Packages

### @worketa/api

**Production-grade API client with:**

- Axios instance with request/response interceptors
- Automatic Bearer token injection
- Token refresh on 401 (with queue to prevent thundering herd)
- Request ID generation for distributed tracing
- Error normalization
- Complete TypeScript types for all backend entities
- React Query hooks for CRUD operations

**Features:**

- Post-login token setup: `apiClient.setToken(token)`
- Automatic token refresh with retry queue
- Request IDs for tracing: `X-Request-ID: {timestamp}-{randomId}`
- Error handling without exposing stack traces

**Available Hooks:**

- Authentication: `useLogin()`
- Employees: `useEmployees()`, `useEmployee()`, `useCreateEmployee()`, `useUpdateEmployee()`, `useDeleteEmployee()`
- Vehicles: `useVehicles()`, `useVehicle()`, `useCreateVehicle()`, `useUpdateVehicle()`
- Trips: `useTrips()`, `useTrip()`, `useCreateTrip()`, `useUpdateTrip()`
- Companies: `useCompanies()`, `useCreateCompany()`
- Attendance: `useAttendance()`, `useMarkAttendance()`
- Payroll: `usePayroll()`, `useCreatePayroll()`
- Advances: `useAdvances()`, `useCreateAdvance()`

**Usage Example:**

```typescript
import { ApiClient, useEmployees } from '@worketa/api';

// Setup (in App.tsx)
const apiClient = new ApiClient({
  baseURL: process.env.VITE_API_BASE_URL,
  getToken: () => localStorage.getItem('authToken'),
  onTokenRefresh: (newToken) => {
    localStorage.setItem('authToken', newToken);
  },
  onUnauthorized: () => {
    window.location.href = '/login';
  },
});

// In components
function EmployeeList() {
  const { data: employees, isLoading, error } = useEmployees();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {employees?.data.map(emp => (
        <li key={emp.id}>{emp.firstName} {emp.lastName}</li>
      ))}
    </ul>
  );
}
```

### @worketa/auth

**Authentication & session management:**

- AuthContext provider wraps entire app
- useAuth hook for components
- Token storage (localStorage for web, AsyncStorage for mobile)
- Session persistence across refreshes
- Login/logout helpers
- Protected route component

**Usage Example:**

```typescript
import { AuthProvider, useAuth } from '@worketa/auth';

// Wrap app
<AuthProvider>
  <App />
</AuthProvider>

// In components
function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div>
      <span>Welcome, {user?.firstName}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Protected routes
<Route
  path="/dashboard"
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
/>
```

### @worketa/schemas

**Centralized validation & constants:**

- Zod schemas for all forms (Login, CreateEmployee, CreateVehicle, etc.)
- Constants: API endpoints, roles, employee types, vehicle types
- Shared TypeScript types
- Utility functions: formatDate, formatCurrency, calculateDuration
- Form error messages

**Usage Example:**

```typescript
import { schemas, constants } from '@worketa/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const ROLES = constants.USER_ROLES;  // ['ADMIN', 'MANAGER', 'DRIVER']

function LoginForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schemas.loginSchema),
  });

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

### @worketa/ui

**Reusable component library:**

- Button, Input, Select, Textarea, Checkbox, Radio
- Card, Badge, Alert, Toast
- Modal, Dropdown, Tabs, Accordion
- Form components (FormField, FormControl, FormMessage)
- Layout: Sidebar, Header, Footer

Uses shadcn/ui pattern with Headless UI + TailwindCSS.

## 🎨 Web App Structure

```
apps/web/src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── MainLayout.tsx
├── features/
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── KPICard.tsx
│   │   └── ActivityChart.tsx
│   ├── employees/
│   │   ├── EmployeeList.tsx
│   │   ├── EmployeeForm.tsx
│   │   ├── EmployeeDetail.tsx
│   │   └── EmployeeCreate.tsx
│   ├── vehicles/
│   ├── trips/
│   ├── companies/
│   ├── attendance/
│   ├── payroll/
│   ├── advances/
│   └── settings/
├── hooks/
│   ├── useAsync.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── stores/
│   ├── uiStore.ts
│   ├── filterStore.ts
│   └── notificationStore.ts
├── utils/
│   ├── api.ts
│   ├── format.ts
│   └── validation.ts
├── types/
│   ├── index.ts
│   └── api.ts
├── styles/
│   ├── globals.css
│   └── animations.css
├── App.tsx
└── main.tsx
```

## 📱 Android App Structure

```
apps/android/src/
├── components/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── ...
├── screens/
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── EmployeeListScreen.tsx
│   ├── EmployeeDetailScreen.tsx
│   └── ...
├── navigation/
│   ├── AuthNavigator.tsx
│   ├── MainNavigator.tsx
│   └── RootNavigator.tsx
├── features/
│   ├── dashboard/
│   ├── employees/
│   ├── vehicles/
│   └── ...
├── hooks/
├── stores/
├── utils/
├── theme/
│   └── theme.ts
└── App.tsx
```

## 🔐 Security Best Practices

### Token Management

```typescript
// Automatic token injection in all requests
// Token refresh on 401 with queue to prevent race conditions
// Request ID generation for tracing

// Manual token setup after login
apiClient.setToken(loginResponse.token);

// Automatic cleanup on logout
apiClient.clearToken();
```

### Protected Routes

```typescript
<ProtectedRoute
  component={Dashboard}
  requiredRoles={['ADMIN', 'MANAGER']}
/>
```

### Form Validation

```typescript
// Client-side: Zod schemas prevent invalid submissions
// Server-side: Backend validates all inputs
// No sensitive data in logs or error messages
```

### API Security

```typescript
// All requests use https in production
// CORS configured on backend
// Request/response timeouts
// No sensitive data in URLs
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Web app tests only
pnpm --filter @worketa/web test

# Android app tests only
pnpm --filter @worketa/android test
```

## 🚢 Deployment

### Web Deployment (Vercel)

```bash
# Prerequisites: Vercel account, GitHub connected

# First time setup
vercel

# Deploy to staging
vercel deploy

# Deploy to production
vercel deploy --prod
```

### Android Deployment (Google Play)

```bash
# Build production APK
pnpm --filter @worketa/android build:android

# Or with EAS (Expo Application Services)
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

## 📊 State Management

**Three-layer state management strategy:**

```typescript
// 1. Server State (React Query)
// Use for: API data, user list, employee details
const { data: employees } = useEmployees();

// 2. UI State (Zustand)
// Use for: sidebar open/close, modal state, filters
const { sidebarOpen, toggleSidebar } = useUIStore();

// 3. Form State (React Hook Form)
// Use for: form inputs, validation
const { register, handleSubmit } = useForm({...});
```

### Zustand Store Example

```typescript
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
  setTheme: (theme) => set({ theme }),
}));
```

## 🎨 Styling Architecture

**TailwindCSS + Utility Classes:**

```typescript
// Atomic classes for rapid development
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-900">
    Employees
  </h2>
  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
    Add Employee
  </Button>
</div>

// Custom CSS for animations
@apply transition-all duration-300 ease-in-out;
```

**Dark Mode:**

```typescript
// Automatic dark mode support
<html className={isDarkMode ? 'dark' : ''}>
  <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
    ...
  </body>
</html>
```

## 🔄 Development Workflow

### Local Development

```bash
# Terminal 1: Watch mode
pnpm dev:web

# Terminal 2: Type checking
pnpm type-check:watch

# Terminal 3: Linting
pnpm lint:watch
```

### Git Workflow

```bash
# Feature branch with conventional commits
git checkout -b feature/add-employee-filter
git commit -m "feat(employees): add filter UI"
git push origin feature/add-employee-filter

# Pre-commit hook runs:
# - ESLint
# - Prettier
# - TypeScript check
# - Unit tests (optional)
```

## 📈 Performance Optimization

- **Code Splitting:** Vite automatically creates chunks for routes
- **Lazy Loading:** `React.lazy()` for route components
- **Image Optimization:** Use `.webp` format with fallbacks
- **Memoization:** `React.memo()` for expensive components
- **Query Caching:** React Query caches API responses
- **CSS-in-JS:** TailwindCSS minification in production
- **Bundle Analysis:** Run `vite-plugin-visualizer`

## 🌐 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS 12+, Android 8+

## 📚 Documentation

- [API Client Documentation](./packages/api/README.md)
- [Auth System Guide](./packages/auth/README.md)
- [Web App Development](./apps/web/README.md)
- [Android App Development](./apps/android/README.md)
- [Component Library](./packages/ui/README.md)

## 🔗 Backend Integration

The frontend integrates with the WORKETA Spring Boot backend:

- **Base URL:** `http://localhost:8080` (dev) or `https://api.worketa.com` (prod)
- **Auth:** JWT Bearer tokens
- **API Versioning:** `/api/v1/*` endpoints
- **Documentation:** See backend [PRODUCTION_AUDIT.md](../backend/PRODUCTION_AUDIT.md)

## 🎯 Feature Roadmap

### Phase 1: Core (Current)

- ✅ Monorepo setup
- ✅ API client with token management
- ⏳ Authentication flows
- ⏳ Dashboard with KPIs
- ⏳ Employee management UI

### Phase 2: Complete Modules

- Trip management with calendar
- Vehicle tracking with maps
- Attendance tracking
- Payroll system
- Advances management
- Company settings

### Phase 3: Advanced

- Real-time notifications
- Offline mode
- Data export (PDF, Excel)
- Advanced analytics
- Mobile app iOS support
- PWA support

### Phase 4: Enterprise

- Multi-language support
- Custom theming
- Audit logging
- Role-based feature flags
- API rate limiting per user

## 🤝 Contributing

1. **Code Style:** ESLint + Prettier
2. **Types:** TypeScript strict mode
3. **Commits:** Conventional commits
4. **Testing:** Unit tests for utils, integration tests for features
5. **Documentation:** Update README for new features

## 📄 License

WORKETA Frontend © 2024 All Rights Reserved

## 🆘 Troubleshooting

### Port already in use

```bash
# Web (3000)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Android (8081)
lsof -i :8081 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Module not found errors

```bash
# Clear node_modules and reinstall
pnpm install --force
```

### Build fails

```bash
# Clear build cache
pnpm clean
pnpm install
pnpm build
```

## 📞 Support & Contact

For issues, questions, or suggestions:

1. Check existing issues in GitHub
2. Create a new issue with reproduction steps
3. Contact the development team

---

**Last Updated:** 2024
**Maintainers:** WORKETA Development Team
