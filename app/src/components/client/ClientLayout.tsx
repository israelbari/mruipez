import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Panel', path: '/client', icon: LayoutDashboard },
  { label: 'Mis Proyectos', path: '/client/projects', icon: FolderOpen },
];

export default function ClientLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-secondary border-r border-border-custom flex flex-col shrink-0">
        <div className="p-6 border-b border-border-custom">
          <Link to="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm">Volver al sitio</span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-bg-tertiary text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-border-custom space-y-3">
          {user && (
            <div className="text-sm text-text-secondary">
              <p className="font-medium text-text-primary">{user.name}</p>
              <p className="text-xs text-text-muted">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
          <span className="text-xs text-text-muted uppercase tracking-wider block">Cliente MRUIPEZ</span>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
