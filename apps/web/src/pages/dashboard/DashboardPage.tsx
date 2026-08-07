import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useApiClient } from '@/hooks/useApiClient';
import { ApiTypes } from '@worketa/api';

export default function DashboardPage() {
  const apiClient = useApiClient();

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<ApiTypes.DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get<ApiTypes.DashboardStats>('/v1/dashboard/stats');

      if ('success' in response && response.success && 'data' in response) {
        return response.data;
      }

      throw new Error(response.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="premium-card px-6 py-5 text-slate-600 shadow-xl">Loading dashboard...</div>
      </div>
    );
  }

  const StatCard = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: number | string;
    icon: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600">
      <div className="flex items-center">
        <div className="text-3xl mr-4">{icon}</div>
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="premium-surface overflow-hidden rounded-[2rem] p-6 shadow-2xl md:p-8 lg:p-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_28%)]" />
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
              Command Center
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
                Welcome to WORKETA
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
                Fleet, workforce, payroll, and attendance management in one responsive workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/payroll"
                className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Review payroll
              </Link>
              <Link
                to="/history"
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                View history
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-3xl bg-white/90 p-4 shadow-lg ring-1 ring-white/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Employees
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {stats?.totalEmployees || 0}
              </p>
            </div>
            <div className="rounded-3xl bg-white/90 p-4 shadow-lg ring-1 ring-white/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Vehicles
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">{stats?.totalVehicles || 0}</p>
            </div>
            <div className="rounded-3xl bg-white/90 p-4 shadow-lg ring-1 ring-white/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Trips
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">{stats?.activeTrips || 0}</p>
            </div>
            <div className="rounded-3xl bg-white/90 p-4 shadow-lg ring-1 ring-white/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Attendance
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {stats
                  ? Math.round((stats.todayAttendance / Math.max(stats.totalEmployees, 1)) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={stats?.totalEmployees || 0} icon="👥" />
        <StatCard label="Active Vehicles" value={stats?.totalVehicles || 0} icon="🚗" />
        <StatCard label="Trips Today" value={stats?.activeTrips || 0} icon="🛣️" />
        <StatCard
          label="Attendance Rate"
          value={`${stats ? Math.round((stats.todayAttendance / Math.max(stats.totalEmployees, 1)) * 100) : 0}%`}
          icon="📊"
        />
      </div>

      <div className="premium-card p-6 md:p-7">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ['👥', 'Manage Employees', '/employees', 'View and manage employee records'],
            ['🚗', 'Manage Vehicles', '/vehicles', 'Track fleet vehicles'],
            ['🛣️', 'Create Trip', '/trips', 'Schedule and track trips'],
            ['📅', 'Attendance', '/attendance', 'Track attendance records'],
            ['💰', 'Payroll', '/payroll', 'Manage payroll and payments'],
            ['🧾', 'History', '/history', 'Review payroll bills and edits'],
          ].map(([icon, title, href, description]) => (
            <Link
              key={href as string}
              to={href as string}
              className="group rounded-3xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:bg-white hover:shadow-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl">{icon as string}</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{title as string}</p>
                  <p className="mt-1 text-sm text-slate-600">{description as string}</p>
                </div>
                <span className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-500">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
