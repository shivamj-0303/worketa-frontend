import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@worketa/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import EmployeesPage from '@/pages/modules/employees/EmployeesPage';
import VehiclesPage from '@/pages/modules/vehicles/VehiclesPage';
import TripsPage from '@/pages/modules/trips/TripsPage';
import AttendancePage from '@/pages/modules/attendance/AttendancePage';
import PendingApprovalsPage from '@/pages/modules/attendance/PendingApprovalsPage';
import PayrollPage from '@/pages/modules/payroll/PayrollPage';
import HistoryPage from '@/pages/modules/history/HistoryPage';
import AdvancesPage from '@/pages/modules/advances/AdvancesPage';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes - Full page layouts */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes - Dashboard layout */}
      <Route
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Modules */}
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/pending" element={<PendingApprovalsPage />} />
        <Route path="attendance/double-approvals" element={<PendingApprovalsPage doubleOnly />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="advances" element={<AdvancesPage />} />
      </Route>

      {/* Catch all - redirect to login or dashboard */}
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}
