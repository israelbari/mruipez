import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, MessageSquare, FileText,
  ArrowLeft, Users, Upload, LogOut, Globe, Layers, UserCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Páginas', path: '/admin/pages', icon: Globe },
  { label: 'Secciones', path: '/admin/sections', icon: Layers },
  { label: 'Portfolio', path: '/admin/projects', icon: FolderOpen },
  { label: 'Mensajes', path: '/admin/messages', icon: MessageSquare },
];

const managementItems = [
  { label: 'Clientes', path: '/admin/clients', icon: UserCircle },
];

const superadminItems = [
  { label: 'Usuarios', path: '/admin/users', icon: Users },
  { label: 'Uploads', path: '/admin/uploads', icon: Upload },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, isSuperadmin, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

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

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <div className="px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-text-muted font-semibold">
              Contenido
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                    active
                      ? 'bg-bg-tertiary text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            <div className="px-4 py-2 mt-4 text-[10px] uppercase tracking-[0.15em] text-text-muted font-semibold">
              Gestión
            </div>
            {managementItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                    active
                      ? 'bg-bg-tertiary text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            {isSuperadmin && (
              <>
                <div className="px-4 py-2 mt-4 text-[10px] uppercase tracking-[0.15em] text-text-muted font-semibold">
                  Superadmin
                </div>
                {superadminItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                        active
                          ? 'bg-bg-tertiary text-accent'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </>
            )}
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
          <span className="text-xs text-text-muted uppercase tracking-wider block">MRUIPEZ Admin</span>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
