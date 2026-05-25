import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, FolderOpen, Loader2, Eye, Plus, Trash2, UserCheck, Power, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdminClients() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  
  // Use our new modular client endpoints
  const { data: clients, isLoading } = trpc.client.listClients.useQuery();

  const createMutation = trpc.client.createClient.useMutation({
    onSuccess: () => {
      utils.client.listClients.invalidate();
      toast.success('Cliente creado correctamente');
      setIsFormOpen(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.client.deleteClient.useMutation({
    onSuccess: () => {
      utils.client.listClients.invalidate();
      toast.success('Cliente eliminado correctamente');
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.auth.updateUser.useMutation({
    onSuccess: () => {
      utils.client.listClients.invalidate();
      toast.success('Estado del cliente actualizado');
    },
  });

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const resetForm = () => {
    setForm({ name: '', email: '', password: '' });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    createMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${name}? Se perderán todos sus proyectos y archivos.`)) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleStatus = (id: number, currentStatus: boolean) => {
    updateStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const filtered = clients?.filter((c) => {
    const s = search.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.email.toLowerCase().includes(s);
  });

  const inputClass = "w-full h-11 bg-bg-primary border border-border-custom rounded px-3 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
  const labelClass = "text-xs uppercase tracking-wider text-text-secondary block mb-2";

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
          <h1 className="font-display text-text-primary text-3xl">Gestión de Clientes</h1>
          <p className="text-sm text-text-secondary mt-1">
            {clients?.length ?? 0} clientes registrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="pl-9 w-[260px] h-10 bg-bg-secondary border border-border-custom rounded text-text-primary text-sm focus:border-accent focus:outline-none"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-bg-primary text-sm font-medium rounded hover:bg-accent transition-colors"
          >
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-custom text-text-muted uppercase text-xs tracking-wider">
              <th className="text-left px-6 py-3">Cliente</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Proyectos</th>
              <th className="text-left px-6 py-3">Archivos</th>
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
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <FolderOpen size={14} className="text-accent" />
                    <span>{client.projectCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-secondary">
                  <span>{client.mediaCount} archivos</span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(client.id, client.isActive)} className="flex items-center gap-1.5 text-xs">
                    {client.isActive ? (
                      <><UserCheck size={14} className="text-emerald-400" /> <span className="text-emerald-400">Activo</span></>
                    ) : (
                      <><Power size={14} className="text-text-muted" /> <span className="text-text-muted">Inactivo</span></>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/clients/${client.id}`)}
                      className="p-2 text-text-secondary hover:text-accent transition-colors rounded hover:bg-bg-tertiary"
                      title="Ver detalle del cliente"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id, client.name || client.email)}
                      className="p-2 text-text-secondary hover:text-red-400 transition-colors rounded hover:bg-bg-tertiary"
                      title="Eliminar cliente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============ Create Dialog ============ */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-bg-secondary border-border-custom text-text-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text-primary font-display text-xl">
              Registrar Nuevo Cliente
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div>
              <label className={labelClass}>Nombre Completo</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="cliente@correo.com"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Contraseña</label>
              <input
                type="password"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="******"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="text-text-secondary">
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-accent text-white hover:bg-accent/90">
                {createMutation.isPending ? 'Guardando...' : 'Crear Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
