import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, X, Film, Image, ArrowUp, ArrowDown, Loader2, Eye } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

type FormMode = 'list' | 'create' | 'edit';

interface AssetForm {
  id?: number;
  url: string;
  type: 'image' | 'video';
  order: number;
}

const emptyForm = {
  name: '',
  category: 'Residential' as 'Residential' | 'Commercial',
  subcategory: 'Exteriors' as 'Interiors' | 'Exteriors',
  image: '',
  video: '',
  aspect: '16:9' as '16:9' | '3:4' | '4:5',
  order: 0,
  featured: false,
  assets: [] as AssetForm[],
};

export default function AdminProjects() {
  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.project.list.useQuery();

  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      toast.success('Proyecto creado correctamente');
    },
    onError: (err) => toast.error('Error al crear: ' + err.message),
  });

  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      toast.success('Proyecto actualizado correctamente');
    },
    onError: (err) => toast.error('Error al actualizar: ' + err.message),
  });

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      toast.success('Proyecto eliminado');
    },
    onError: (err) => toast.error('Error al eliminar: ' + err.message),
  });

  const getPresignedUrlMutation = trpc.upload.getPresignedUrl.useMutation();

  const [mode, setMode] = useState<FormMode>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const handleUpload = async (file: File, type: 'image' | 'video') => {
    setUploading(true);

    try {
      // 1. Solicitar URL firmada de subida al backend
      const presigned = await getPresignedUrlMutation.mutateAsync({
        filename: file.name,
        fileType: file.type,
        isVideo: type === 'video',
      });

      if (presigned.useFallback) {
        // Fallback local: subida a Hono API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            addAsset(data.url, type);
            return;
          }
        }
        throw new Error("Local fallback upload failed");
      } else {
        // Subida directa premium a Cloudflare R2 / S3
        const res = await fetch(presigned.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (res.ok) {
          addAsset(presigned.publicUrl, type);
          toast.success('Archivo subido a Cloudflare R2');
        } else {
          throw new Error('S3 direct upload failed');
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      // FileReader fallback como último recurso
      const reader = new FileReader();
      reader.onloadend = () => {
        addAsset(reader.result as string, type);
      };
      reader.readAsDataURL(file);
      toast.error('Error al subir. Se usará vista previa local.');
    } finally {
      setUploading(false);
    }
  };

  const addAsset = (url: string, type: 'image' | 'video') => {
    setForm((prev) => {
      const newAsset: AssetForm = {
        url,
        type,
        order: prev.assets.length,
      };
      const updatedAssets = [...prev.assets, newAsset];
      const firstImage = updatedAssets.find((a) => a.type === 'image');
      return {
        ...prev,
        assets: updatedAssets,
        image: firstImage ? firstImage.url : prev.image,
      };
    });
  };

  const removeAsset = (index: number) => {
    setForm((prev) => {
      const updated = prev.assets.filter((_, i) => i !== index);
      const reordered = updated.map((a, i) => ({ ...a, order: i }));
      const firstImage = reordered.find((a) => a.type === 'image');
      return {
        ...prev,
        assets: reordered,
        image: firstImage ? firstImage.url : prev.image,
      };
    });
  };

  const moveAsset = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.assets.length) return prev;
      const updated = [...prev.assets];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return { ...prev, assets: updated.map((a, i) => ({ ...a, order: i })) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      video: form.video || undefined,
      assets: form.assets.map((a) => ({ url: a.url, type: a.type, order: a.order })),
    };
    if (mode === 'edit' && editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
      setMode('list');
      setEditingId(null);
      setForm(emptyForm);
    } else {
      createMutation.mutate(payload);
      setMode('list');
      setForm(emptyForm);
    }
  };

  const startEdit = (project: NonNullable<typeof projects>[number]) => {
    setForm({
      name: project.name,
      category: project.category as 'Residential' | 'Commercial',
      subcategory: project.subcategory as 'Interiors' | 'Exteriors',
      image: project.image,
      video: project.video || '',
      aspect: project.aspect as '16:9' | '3:4' | '4:5',
      order: project.order,
      featured: project.featured,
      assets: project.assets?.length
        ? project.assets.map((a) => ({ id: a.id, url: a.url, type: a.type, order: a.order }))
        : [{ url: project.image, type: 'image' as const, order: 0 }],
    });
    setEditingId(project.id);
    setMode('edit');
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
    setDeleteConfirm(null);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const inputClass = "w-full h-11 bg-bg-primary border border-border-custom rounded px-3 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
  const labelClass = "text-xs uppercase tracking-wider text-text-secondary block mb-2";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-text-primary text-3xl">{mode === 'edit' ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h1>
          <button onClick={() => { setMode('list'); setForm(emptyForm); }} className="text-text-secondary hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-custom rounded-lg p-6 space-y-5">
          <div>
            <label className={labelClass}>Nombre</label>
            <input className={inputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Categoría</label>
              <select className={inputClass} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as 'Residential' | 'Commercial' }))}>
                <option value="Residential">Residencial</option>
                <option value="Commercial">Comercial</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Subcategoría</label>
              <select className={inputClass} value={form.subcategory} onChange={e => setForm(p => ({ ...p, subcategory: e.target.value as 'Interiors' | 'Exteriors' }))}>
                <option value="Interiors">Interiores</option>
                <option value="Exteriors">Exteriores</option>
              </select>
            </div>
          </div>

          {/* Assets Manager */}
          <div>
            <label className={labelClass}>Imágenes y Videos ({form.assets.length})</label>
            <div className="space-y-2">
              {form.assets.map((asset, idx) => (
                <div key={asset.id ?? idx} className="flex items-center gap-2 bg-bg-primary border border-border-custom rounded p-2">
                  {asset.type === 'video' ? (
                    <div className="w-12 h-12 flex-shrink-0 bg-bg-tertiary rounded flex items-center justify-center">
                      <Film size={16} className="text-accent" />
                    </div>
                  ) : (
                    <img src={asset.url} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <input
                      className="w-full bg-transparent text-text-primary text-xs truncate focus:outline-none"
                      value={asset.url}
                      onChange={e => {
                        const newAssets = [...form.assets];
                        newAssets[idx] = { ...asset, url: e.target.value };
                        setForm(p => ({ ...p, assets: newAssets }));
                      }}
                    />
                    <span className="text-[10px] text-text-muted uppercase">{asset.type}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => setPreviewAsset({ url: asset.url, type: asset.type })} className="p-1 text-text-muted hover:text-accent" title="Previsualizar">
                      <Eye size={14} />
                    </button>
                    <button type="button" onClick={() => moveAsset(idx, -1)} disabled={idx === 0} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" onClick={() => moveAsset(idx, 1)} disabled={idx === form.assets.length - 1} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30">
                      <ArrowDown size={14} />
                    </button>
                    <button type="button" onClick={() => removeAsset(idx)} className="p-1 text-text-muted hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {form.assets.length === 0 && (
                <div className="text-text-muted text-xs py-4 text-center border border-dashed border-border-custom rounded">
                  No hay assets. Sube imágenes o videos.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <label className="flex items-center gap-2 px-4 py-2 border border-border-custom rounded cursor-pointer hover:border-accent transition-colors text-sm text-text-secondary">
                  <Image size={16} />
                  {uploading ? 'Subiendo...' : 'Añadir imagen'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'image')} />
                </label>
                <label className="flex items-center gap-2 px-4 py-2 border border-border-custom rounded cursor-pointer hover:border-accent transition-colors text-sm text-text-secondary">
                  <Film size={16} />
                  {uploading ? 'Subiendo...' : 'Añadir video'}
                  <input type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'video')} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Aspect Ratio</label>
              <select className={inputClass} value={form.aspect} onChange={e => setForm(p => ({ ...p, aspect: e.target.value as '16:9' | '3:4' | '4:5' }))}>
                <option value="16:9">16:9</option>
                <option value="3:4">3:4</option>
                <option value="4:5">4:5</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Orden</label>
              <input type="number" className={inputClass} value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-accent" />
            <span className="text-sm text-text-primary">Destacado en inicio</span>
          </label>

          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={isMutating} className="px-6 py-2.5 bg-text-primary text-bg-primary text-sm font-medium rounded hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2">
              {isMutating && <Loader2 size={16} className="animate-spin" />}
              {mode === 'edit' ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => { setMode('list'); setForm(emptyForm); }} className="px-6 py-2.5 border border-border-custom text-text-secondary text-sm rounded hover:border-text-secondary transition-colors">
              Cancelar
            </button>
          </div>
        </form>

        {/* Asset Preview Modal */}
        {previewAsset && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(18, 18, 18, 0.95)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPreviewAsset(null)}
          >
            <div className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setPreviewAsset(null)}
                className="absolute -top-10 right-0 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={24} />
              </button>
              {previewAsset.type === 'video' ? (
                <VideoPlayer src={previewAsset.url} className="w-full max-h-[75vh] aspect-video" />
              ) : (
                <img
                  src={previewAsset.url}
                  alt="Preview"
                  className="max-w-full max-h-[75vh] object-contain rounded"
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-text-primary text-3xl">Proyectos</h1>
        <button onClick={() => setMode('create')} className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-bg-primary text-sm font-medium rounded hover:bg-accent transition-colors">
          <Plus size={16} /> Nuevo Proyecto
        </button>
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-custom text-text-muted uppercase text-xs tracking-wider">
                <th className="text-left px-6 py-3">Proyecto</th>
                <th className="text-left px-6 py-3">Categoría</th>
                <th className="text-left px-6 py-3">Assets</th>
                <th className="text-left px-6 py-3">Orden</th>
                <th className="text-left px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {(projects ?? []).map((project) => (
                <tr key={project.id} className="group hover:bg-bg-tertiary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={project.image} alt="" className="w-10 h-10 object-cover rounded" />
                      <div>
                        <div className="text-text-primary font-medium">{project.name}</div>
                        {project.featured && <span className="text-xs text-accent">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{project.category} / {project.subcategory}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <span className="text-xs bg-bg-tertiary text-text-secondary px-2 py-1 rounded flex items-center gap-1">
                        <Image size={12} /> {project.assets?.filter(a => a.type === 'image').length ?? 0}
                      </span>
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded flex items-center gap-1">
                        <Film size={12} /> {project.assets?.filter(a => a.type === 'video').length ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{project.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(project)} className="p-2 text-text-secondary hover:text-accent transition-colors rounded hover:bg-bg-tertiary">
                        <Pencil size={16} />
                      </button>
                      {deleteConfirm === project.id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDelete(project.id)} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition-colors">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-text-muted hover:text-text-secondary">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(project.id)} className="p-2 text-text-secondary hover:text-red-400 transition-colors rounded hover:bg-bg-tertiary">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
