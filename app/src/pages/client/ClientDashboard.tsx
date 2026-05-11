import { useAuth } from '@/hooks/useAuth';
import { FolderOpen, Upload, Clock } from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-text-primary">Panel de Cliente</h1>
        <p className="text-text-secondary mt-1">
          Bienvenido, {user?.name || user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <FolderOpen size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-light text-text-primary">0</p>
              <p className="text-sm text-text-secondary">Proyectos asignados</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Upload size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-light text-text-primary">0</p>
              <p className="text-sm text-text-secondary">Uploads realizados</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Clock size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-light text-text-primary">0</p>
              <p className="text-sm text-text-secondary">Pendientes de aprobación</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
        <h2 className="text-lg font-medium text-text-primary mb-4">Próximamente</h2>
        <p className="text-text-secondary">
          Aquí podrás ver tus proyectos asignados, subir archivos y solicitar aprobaciones.
          El sistema de gestión de proyectos para clientes está en desarrollo.
        </p>
      </div>
    </div>
  );
}
