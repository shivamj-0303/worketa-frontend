import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@worketa/auth';
import Button from '@/components/ui/Button';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Employees', path: '/employees', icon: '👥' },
  { label: 'Vehicles', path: '/vehicles', icon: '🚗' },
  { label: 'Trips', path: '/trips', icon: '🛣️' },
  { label: 'Pending Approvals', path: '/attendance/pending', icon: '⏳' },
  { label: 'Double Approvals', path: '/attendance/double-approvals', icon: '2x' },
  { label: 'Payroll', path: '/payroll', icon: '💰' },
  { label: 'History', path: '/history', icon: '🧾' },
  { label: 'Advances', path: '/advances', icon: '💳' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-950 text-slate-900 md:bg-transparent">
      {/* Mobile Header */}
      <header className="md:hidden premium-surface sticky top-0 z-50 flex items-center justify-between px-4 py-4 text-slate-900">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-600">
            WORKETA
          </p>
          <h1 className="text-lg font-bold">
            {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-700 shadow-sm"
          title="Toggle menu"
        >
          ☰
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col overflow-hidden border-r border-white/10 bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 md:flex`}
      >
        {/* Logo (Desktop) */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 shrink-0">
          {sidebarOpen && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-300">
                Fleet OS
              </p>
              <h1 className="text-xl font-bold tracking-tight text-white">WORKETA</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
            type="button"
          >
            <span className="flex items-center justify-center leading-none">
              {sidebarOpen ? '←' : '→'}
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mb-1 flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3.5 transition-all min-w-0 ${
                location.pathname === item.path
                  ? 'bg-white/12 text-white shadow-lg shadow-black/10 ring-1 ring-white/10'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/10 p-4 shrink-0">
          {sidebarOpen && user && (
            <div className="mb-3 min-w-0 rounded-2xl bg-white/5 p-3">
              <p className="text-sm font-medium truncate text-white">{user.email}</p>
              <p className="text-xs text-slate-300 truncate">{user.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
          >
            {sidebarOpen ? 'Logout' : '🚪'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex min-h-screen flex-1 flex-col bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f9_100%)] ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}
      >
        {/* Topbar */}
        <header className="hidden md:flex items-center justify-between shrink-0 border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
              Operations
            </p>
            <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4 ml-4 min-w-0">
            <span className="truncate text-sm text-slate-600">
              {user?.firstName} {user?.lastName}
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 text-xs font-bold text-white shadow-md">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="h-full p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden sticky bottom-0 z-50 border-t border-slate-200/70 bg-white/90 px-2 py-2 backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-2 overflow-x-auto">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                    : 'text-slate-500'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
