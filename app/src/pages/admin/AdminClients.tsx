import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import { Search, FolderOpen, Upload, Power, UserCheck, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminClients() {
  const utils = trpc.useUtils();
  const { data: clients, isLoading } = trpc.auth.listClients.useQuery();
  const { data: projects } = trpc.project.list.useQuery();

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<NonNullable<typeof clients>[number] | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const assignMutation = trpc.auth.assignProject.useMutation({
    onSuccess: () => {
      utils.auth.listClients.invalidate();
      toast.success('Proyecto asignado');
    },
    onError: (err) => toast.error(err.message),
  });

  const removeProjectMutation = trpc.auth.removeProject.useMutation({
    onSuccess: () => {
      utils.auth.listClients.invalidate();
      toast.success('Proyecto desasignado');
    },
    onError: (err) => toast.error(err.message),
  });

  const updateUserMutation = trpc.auth.updateUser.useMutation({
    onSuccess: () => {
      utils.auth.listClients.invalidate();
      toast.success('Estado actualizado');
    },
  });

  const filtered = clients?.filter((c) => {
    const s = search.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.email.toLowerCase().includes(s);
  });

  const openDetail = (client: NonNullable<typeof clients>[number]) => {
    setSelectedClient(client);
    setShowDetail(true);
  };

  const toggleStatus = (client: NonNullable<typeof clients>[number]) => {
    updateUserMutation.mutate({ id: client.id, isActive: !client.isActive });
  };

  const isAssigned = (client: NonNullable<typeof clients>[number], projectId: number) => {
    return client.assignedProjects?.includes(projectId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-text-primary text-3xl">Clientes</h1>
          <p className="text-sm text-text-secondary mt-1">
            {clients?.length ?? 0} clientes registrados
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="pl-9 w-[260px] h-10 bg-bg-primary border border-border-custom rounded text-text-primary text-sm focus:border-accent focus:outline-none"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-custom text-text-muted uppercase text-xs tracking-wider">
              <th className="text-left px-6 py-3">Cliente</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Proyectos</th>
              <th className="text-left px-6 py-3">Uploads</th>
              <th className="text-left px-6 py-3">Estado</th>
              <th className="text-left px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-custom">
            {filtered?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                  No hay clientes registrados
                </td>
              </tr>
            )}
            {filtered?.map((client) => (
              <tr key={client.id} className="group hover:bg-bg-tertiary/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
                      {client.name?.charAt(0) ?? client.email.charAt(0)}
                    </div>
                    <span className="text-text-primary font-medium">{client.name || client.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-secondary">{client.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <FolderOpen size={14} className="text-accent" />
                    <span className="text-text-primary">{client.assignedProjects?.length ?? 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Upload size={14} className="text-text-secondary" />
                    <span className="text-text-secondary">{client.uploadCount ?? 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(client)} className="flex items-center gap-1.5 text-xs">
                    {client.isActive ? (
                      <><UserCheck size={14} className="text-emerald-400" /> <span className="text-emerald-400">Activo</span></>
                    ) : (
                      <><Power size={14} className="text-text-muted" /> <span className="text-text-muted">Inactivo</span></>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => openDetail(client)} className="p-2 text-text-secondary hover:text-accent transition-colors rounded hover:bg-bg-tertiary">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Client Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-bg-secondary border-border-custom text-text-primary max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-text-primary font-display text-xl">
              {selectedClient?.name || selectedClient?.email}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-bg-primary border border-border-custom rounded-lg p-4 text-center">
                <FolderOpen className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-display text-text-primary">{selectedClient?.assignedProjects?.length ?? 0}</p>
                <p className="text-xs text-text-secondary">Proyectos</p>
              </div>
              <div className="bg-bg-primary border border-border-custom rounded-lg p-4 text-center">
                <Upload className="w-5 h-5 text-text-secondary mx-auto mb-2" />
                <p className="text-2xl font-display text-text-primary">{selectedClient?.uploadCount ?? 0}</p>
                <p className="text-xs text-text-secondary">Uploads</p>
              </div>
              <div className="bg-bg-primary border border-border-custom rounded-lg p-4 text-center">
                <Power className="w-5 h-5 text-text-secondary mx-auto mb-2" />
                <p className="text-lg font-display text-text-primary">{selectedClient?.isActive ? 'Activo' : 'Inactivo'}</p>
                <p className="text-xs text-text-secondary">Estado</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">Asignar Proyectos</h3>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {projects?.map((project) => {
                  const assigned = selectedClient && isAssigned(selectedClient, project.id);
                  return (
                    <button
                      key={project.id}
                      onClick={() => {
                        if (!selectedClient) return;
                        if (assigned) {
                          removeProjectMutation.mutate({ userId: selectedClient.id, projectId: project.id });
                        } else {
                          assignMutation.mutate({ userId: selectedClient.id, projectId: project.id });
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm border transition-colors ${
                        assigned
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border-custom text-text-secondary hover:border-text-secondary'
                      }`}
                    >
                      <img src={project.image} alt="" className="w-8 h-8 object-cover rounded" />
                      <span className="truncate">{project.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
