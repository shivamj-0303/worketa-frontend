# WORKETA Frontend - Implementation Guide

Complete step-by-step guide for implementing the WORKETA Transport Management System frontend ecosystem.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Setup Instructions](#setup-instructions)
5. [Package Reference](#package-reference)
6. [Frontend Development](#frontend-development)
7. [Mobile Development](#mobile-development)
8. [Deployment](#deployment)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

## Project Overview

WORKETA Frontend is a monorepo containing:

- **Web Application:** React 19 + Vite + TailwindCSS
- **Android Application:** React Native + TypeScript
- **Shared Packages:** API client, authentication, validation schemas, UI components

### Key Statistics

- 3 production-ready packages
- 50+ API endpoints integrated
- 100+ TypeScript types
- 0% external UI dependencies (build custom with TailwindCSS)

## Architecture

### Monorepo Structure

```
frontend/
├── packages/
│   ├── api/              # API client, types, React Query hooks
│   ├── auth/             # Authentication context and guards
│   ├── schemas/          # Zod validation, enums, utilities
│   └── ui/               # Reusable components (coming soon)
├── apps/
│   ├── web/              # React web app (coming soon - implementation)
│   └── android/          # React Native app (coming soon)
├── .github/workflows/    # CI/CD pipelines
└── docs/                 # Documentation
```

### State Management Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Application                          │
└─────────────────────────────────────────────────────────┘
           │                        │
           │                        │
      ┌────▼────┐          ┌────────▼─────┐
      │ UI State│          │ Server State │
      │ (Zustand)          │(React Query) │
      └────┬────┘          └────────┬─────┘
           │                        │
           │          ┌────────────┬┘
           │          │            │
           │      ┌───▼──────┐   ┌─▼────────┐
           │      │ Forms    │   │  API    │
           │      │ (RHF)    │   │ (@api)  │
           │      └──────────┘   └─────────┘
           │
      ┌────▼──────────────┐
      │ localStorage      │
      │ sessionStorage    │
      └───────────────────┘
```

**Three-Layer State:**

1. **Server State (React Query)**
   - API data (employees, vehicles, trips, etc.)
   - Automatic caching and synchronization
   - Handles loading/error states

2. **UI State (Zustand)**
   - Sidebar collapsed/expanded
   - Modal visibility
   - Filter selections
   - Theme (light/dark)

3. **Form State (React Hook Form)**
   - Input values
   - Validation errors
   - Submission state

## Prerequisites

### System Requirements

- Node.js 20.0.0 or higher
- pnpm 9.0.0 or higher
- Git 2.30+

### Check Installation

```bash
# Check versions
node --version      # Should be v20+
npm --version       # Should be 10+
pnpm --version      # Should be 9+

# Or install pnpm globally
npm install -g pnpm
```

### Backend Server

- WORKETA backend running on `http://localhost:8080` (or update `.env.local`)
- PostgreSQL database connected
- JWT authentication enabled

## Setup Instructions

### 1. Install Dependencies

```bash
cd /path/to/frontend

# Install pnpm if needed
npm install -g pnpm@latest

# Install all monorepo dependencies
pnpm install

# This will:
# - Install root dependencies
# - Install all workspace (packages/ and apps/) dependencies
# - Link packages to each other
# - Set up pre-commit hooks
```

### 2. Verify Installation

```bash
# Check monorepo structure
pnpm list --depth=0

# Should show:
# @worketa/api
# @worketa/auth
# @worketa/schemas
# @worketa/web
# @worketa/android
```

### 3. Configure Environment

**Web App (`apps/web/.env.local`):**

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=WORKETA
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG=false
```

**Android App (`apps/android/.env.local`):**

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080
EXPO_PUBLIC_APP_NAME=WORKETA
EXPO_PUBLIC_ENABLE_DEBUG=false
```

### 4. Start Development Server

```bash
# Terminal 1: Start web dev server
pnpm dev:web
# Server runs on http://localhost:5173

# Terminal 2: Type checking (optional)
pnpm type-check:watch

# Terminal 3: Linting (optional)
pnpm lint:watch
```

## Package Reference

### @worketa/api

**Centralized API client with token management**

Location: `packages/api/`

**Files:**

- `src/client.ts` - ApiClient class with interceptors
- `src/types.ts` - Complete TypeScript interfaces
- `src/hooks.ts` - React Query hooks for all endpoints

**Setup:**

```typescript
// src/App.tsx
import { ApiClient } from '@worketa/api';

const apiClient = new ApiClient({
  baseURL: process.env.VITE_API_BASE_URL,
  getToken: () => localStorage.getItem('authToken'),
  onTokenRefresh: (token) => {
    localStorage.setItem('authToken', token);
  },
  onUnauthorized: () => {
    window.location.href = '/login';
  },
});

export { apiClient };
```

**Key Features:**

- ✅ Automatic token injection
- ✅ Token refresh on 401 with request queue
- ✅ Request ID generation (X-Request-ID header)
- ✅ Error normalization
- ✅ 50+ React Query hooks

### @worketa/auth

**Authentication context and guards**

Location: `packages/auth/`

**Files:**

- `src/context.tsx` - AuthProvider, useAuth hook, HOCs

**Setup:**

```typescript
// src/main.tsx
import { AuthProvider } from '@worketa/auth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>,
);
```

**Key Features:**

- ✅ Authentication context
- ✅ Session persistence
- ✅ Role-based access control
- ✅ Protected route guards

### @worketa/schemas

**Validation schemas and constants**

Location: `packages/schemas/`

**Files:**

- `src/schemas.ts` - Zod schemas, enums, utilities

**Usage:**

```typescript
import { schemas, constants, utils } from '@worketa/schemas';

// In forms
const { register } = useForm({
  resolver: zodResolver(schemas.auth.login),
});

// In components
const roles = constants.roles; // ['ADMIN', 'MANAGER', ...]

// Utilities
const formatted = utils.formatCurrency(10000);
```

**Key Features:**

- ✅ Zod validation schemas for all forms
- ✅ TypeScript enums
- ✅ API endpoint constants
- ✅ Utility functions

## Frontend Development

### Creating the Web App

The web app structure is not yet created. Follow these steps:

#### 1. Create Vite Config

```bash
cd apps/web
touch vite.config.ts
```

**`apps/web/vite.config.ts`:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@worketa/api': path.resolve(__dirname, '../../packages/api/src'),
      '@worketa/auth': path.resolve(__dirname, '../../packages/auth/src'),
      '@worketa/schemas': path.resolve(__dirname, '../../packages/schemas/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
```

#### 2. Create TypeScript Config

**`apps/web/tsconfig.json`:**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "target": "ES2020",
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@worketa/api": ["../../packages/api/src"],
      "@worketa/auth": ["../../packages/auth/src"],
      "@worketa/schemas": ["../../packages/schemas/src"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

#### 3. Create TailwindCSS Config

**`apps/web/tailwind.config.ts`:**

```typescript
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0369a1',
          950: '#001a33',
        },
      },
    },
  },
  plugins: [forms],
  darkMode: 'class',
} satisfies Config;
```

#### 4. Create PostCSS Config

**`apps/web/postcss.config.js`:**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### 5. Create Main Styles

**`apps/web/src/styles/globals.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50;
  }

  input,
  textarea,
  select {
    @apply rounded border border-gray-300 dark:border-gray-700;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors;
  }

  .card {
    @apply bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800;
  }
}
```

#### 6. Create App Component

**`apps/web/src/App.tsx`:**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@worketa/auth';
import { Routes, Route } from 'react-router-dom';

import LoginPage from './features/auth/LoginPage';
import Dashboard from './features/dashboard/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* More routes */}
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

#### 7. Create Main Entry Point

**`apps/web/src/main.tsx`:**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

#### 8. Create Index HTML

**`apps/web/index.html`:**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WORKETA - Transport Management System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Project Folder Structure

```
apps/web/src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PrivateRoute.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── Footer.tsx
│       └── MainLayout.tsx
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── useAuthForm.ts
│   │   └── api.ts
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── KPICard.tsx
│   │   ├── ActivityChart.tsx
│   │   └── useStats.ts
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
│   ├── useDebounce.ts
│   └── usePagination.ts
├── stores/
│   ├── uiStore.ts
│   ├── filterStore.ts
│   └── notificationStore.ts
├── utils/
│   ├── api.ts
│   ├── format.ts
│   ├── validation.ts
│   └── constants.ts
├── types/
│   ├── index.ts
│   └── api.ts
├── styles/
│   ├── globals.css
│   ├── animations.css
│   └── utilities.css
├── App.tsx
└── main.tsx
```

### Important Npm Scripts

```json
{
  "scripts": {
    "dev:web": "pnpm --filter @worketa/web dev",
    "build:web": "pnpm --filter @worketa/web build",
    "preview:web": "pnpm --filter @worketa/web preview",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest"
  }
}
```

## Mobile Development

### Android Setup (Coming Soon)

```bash
# Initialize React Native project
cd apps/android
npx create-expo-app worketa-android

# Or with bare React Native
npx react-native init worketa-android --template --directory .
```

## Deployment

### Web Deployment (Vercel)

```bash
# Connect to Vercel
vercel link

# Deploy to production
vercel deploy --prod

# Environment variables configured in Vercel dashboard:
# - VITE_API_BASE_URL=https://api.worketa.com
# - VITE_APP_VERSION=1.0.0
```

### CI/CD with GitHub Actions

**`.github/workflows/web.yml`:**

```yaml
name: Deploy Web App

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
      - 'packages/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm build:web

      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Common Tasks

### Add New API Endpoint

1. **Add type in `@worketa/api/src/types.ts`:**

```typescript
export interface Report {
  id: string;
  title: string;
  // ...
}
```

2. **Add hook in `@worketa/api/src/hooks.ts`:**

```typescript
export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => apiClient.get<ApiResponse<Report[]>>('/api/v1/reports'),
  });
}
```

3. **Export from `@worketa/api/src/index.ts`**

4. **Use in component:**

```typescript
const { data: reports } = useReports();
```

### Add New Form Schema

1. **Add in `@worketa/schemas/src/schemas.ts`:**

```typescript
export const reportSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title required'),
    // ...
  }),
};
```

2. **Export in `@worketa/schemas/src/index.ts`**

3. **Use in form:**

```typescript
const form = useForm({
  resolver: zodResolver(schemas.report.create),
});
```

### Add New Feature Page

1. **Create feature folder:** `apps/web/src/features/newfeature/`

2. **Create components:**
   - `NewFeatureList.tsx`
   - `NewFeatureForm.tsx`
   - `NewFeatureDetail.tsx`

3. **Add route:**

```typescript
<Route path="/newfeature" element={<NewFeatureList />} />
```

### Add Navigation Item

1. **Update `Sidebar.tsx`:**

```typescript
const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Employees', href: '/employees' },
  { label: 'New Feature', href: '/newfeature' }, // Add here
];
```

## Troubleshooting

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules
pnpm install --force
```

### Port Already in Use

```bash
# Find and kill process
lsof -i :5173
kill -9 <PID>

# Or use different port
pnpm dev:web -- --port 5174
```

### TypeScript Errors

```bash
# Check all errors
pnpm type-check

# Watch mode
pnpm type-check:watch
```

### API Connection Failed

1. Check backend is running: `http://localhost:8080/actuator/health`
2. Check `.env.local` has correct `VITE_API_BASE_URL`
3. Check CORS is enabled on backend
4. Check network tab in DevTools

### Token Not Being Sent

1. Verify login response includes token
2. Check `getToken()` function in ApiClient setup
3. Check localStorage has 'authToken' key
4. Verify token is not expired

## Next Steps

1. ✅ **Monorepo Setup** - Complete
2. ✅ **API Package** - Complete with 50+ hooks
3. ✅ **Auth Package** - Complete with context
4. ✅ **Schemas Package** - Complete with validation
5. ⏳ **Web App Implementation** - Build main pages
6. ⏳ **Android App** - React Native setup
7. ⏳ **CI/CD** - GitHub Actions workflows
8. ⏳ **Deployment** - Vercel + Play Store

## Support

- **Backend API:** See `/backend/PRODUCTION_AUDIT.md`
- **Frontend Docs:** See individual package READMEs
- **Issues:** Create GitHub issue with reproduction steps
