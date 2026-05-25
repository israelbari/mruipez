import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdminPages() {
  const utils = trpc.useUtils();
  const { data: pages, isLoading } = trpc.page.list.useQuery();

  const createMutation = trpc.page.create.useMutation({
    onSuccess: () => {
      utils.page.list.invalidate();
      toast.success('Página creada');
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.page.update.useMutation({
    onSuccess: () => {
      utils.page.list.invalidate();
      toast.success('Página actualizada');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.page.delete.useMutation({
    onSuccess: () => {
      utils.page.list.invalidate();
      toast.success('Página eliminada');
    },
    onError: (err) => toast.error(err.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', metaTitle: '', metaDescription: '' });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', slug: '', metaTitle: '', metaDescription: '' });
    setShowForm(true);
  };

  const openEdit = (page: NonNullable<typeof pages>[number]) => {
    setEditingId(page.id);
    setForm({
      name: page.name,
      slug: page.slug,
      metaTitle: page.metaTitle ?? '',
      metaDescription: page.metaDescription ?? '',
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Nombre y slug son obligatorios');
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate({ name: form.name, slug: form.slug, metaTitle: form.metaTitle || undefined, metaDescription: form.metaDescription || undefined });
    }
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar esta página? Se eliminarán también sus secciones.')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleToggle = (page: NonNullable<typeof pages>[number]) => {
    updateMutation.mutate({ id: page.id, isActive: !page.isActive });
  };

  const moveOrder = (page: NonNullable<typeof pages>[number], direction: number) => {
    const newOrder = page.order + direction;
    updateMutation.mutate({ id: page.id, order: newOrder });
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-text-primary text-3xl">Páginas</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona las páginas del sitio</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-bg-primary text-sm font-medium rounded hover:bg-accent transition-colors">
          <Plus size={16} /> Nueva Página
        </button>
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-custom text-text-muted uppercase text-xs tracking-wider">
              <th className="text-left px-6 py-3">Orden</th>
              <th className="text-left px-6 py-3">Página</th>
              <th className="text-left px-6 py-3">Slug</th>
              <th className="text-left px-6 py-3">Estado</th>
              <th className="text-left px-6 py-3">Meta</th>
              <th className="text-left px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-custom">
            {(pages ?? []).map((page) => (
              <tr key={page.id} className="group hover:bg-bg-tertiary/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveOrder(page, -1)} className="p-1 text-text-muted hover:text-text-primary">
                      <ArrowUp size={14} />
                    </button>
                    <span className="text-text-secondary w-6 text-center">{page.order}</span>
                    <button onClick={() => moveOrder(page, 1)} className="p-1 text-text-muted hover:text-text-primary">
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-text-primary font-medium">{page.name}</div>
                </td>
                <td className="px-6 py-4 text-text-secondary">/{page.slug}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggle(page)} className="flex items-center gap-1.5 text-xs">
                    {page.isActive ? (
                      <><Eye size={14} className="text-emerald-400" /> <span className="text-emerald-400">Activa</span></>
                    ) : (
                      <><EyeOff size={14} className="text-text-muted" /> <span className="text-text-muted">Inactiva</span></>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  {page.metaTitle ? <Globe size={14} className="text-accent" /> : <span className="text-text-muted">—</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(page)} className="p-2 text-text-secondary hover:text-accent transition-colors rounded hover:bg-bg-tertiary">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(page.id)} className="p-2 text-text-secondary hover:text-red-400 transition-colors rounded hover:bg-bg-tertiary">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-bg-secondary border-border-custom text-text-primary max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-text-primary font-display text-xl">
              {editingId ? 'Editar Página' : 'Nueva Página'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className={labelClass}>Nombre</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Meta Título</label>
              <input className={inputClass} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Meta Descripción</label>
              <input className={inputClass} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-text-secondary">Cancelar</Button>
            <Button onClick={handleSave} className="bg-accent text-white hover:bg-accent/90">
              {editingId ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
