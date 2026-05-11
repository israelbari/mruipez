import { useState } from 'react';
import { useLocalProjects, type LocalProject } from '@/hooks/useLocalProjects';
import { Pencil, Trash2, Plus, X, Film, Image } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

type FormMode = 'list' | 'create' | 'edit';

const emptyForm = {
  name: '',
  category: 'Residential' as 'Residential' | 'Commercial',
  subcategory: 'Exteriors' as 'Interiors' | 'Exteriors',
  image: '',
  video: '',
  aspect: '16:9' as '16:9' | '3:4' | '4:5',
  order: 0,
  featured: false,
};

export default function AdminProjects() {
  const { projects, add, update, remove } = useLocalProjects();
  const [mode, setMode] = useState<FormMode>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleUpload = async (file: File, type: 'image' | 'video') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    if (type === 'image') setUploadingImage(true);
    else setUploadingVideo(true);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setForm(prev => ({ ...prev, [type]: data.url }));
        }
      } else {
        // Fallback: use FileReader for local preview
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setForm(prev => ({ ...prev, [type]: result }));
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback: use FileReader for local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setForm(prev => ({ ...prev, [type]: result }));
      };
      reader.readAsDataURL(file);
    } finally {
      if (type === 'image') setUploadingImage(false);
      else setUploadingVideo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      video: form.video || undefined,
    };
    if (mode === 'edit' && editingId) {
      update(editingId, data);
      setMode('list');
      setEditingId(null);
      setForm(emptyForm);
    } else {
      add(data);
      setMode('list');
      setForm(emptyForm);
    }
  };

  const startEdit = (project: LocalProject) => {
    setForm({
      name: project.name,
      category: project.category,
      subcategory: project.subcategory,
      image: project.image,
      video: project.video || '',
      aspect: project.aspect,
      order: project.order,
      featured: project.featured,
    });
    setEditingId(project.id);
    setMode('edit');
  };

  const inputClass = "w-full h-11 bg-bg-primary border border-border-custom rounded px-3 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
  const labelClass = "text-xs uppercase tracking-wider text-text-secondary block mb-2";

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-text-primary text-3xl">{mode === 'edit' ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h1>
          <button onClick={() => { setMode('list'); setForm(emptyForm); }} className="text-text-secondary hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-custom rounded-lg p-6 space-y-5">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as 'Residential' | 'Commercial' }))}>
                <option value="Residential">Residencial</option>
                <option value="Commercial">Comercial</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Subcategory</label>
              <select className={inputClass} value={form.subcategory} onChange={e => setForm(p => ({ ...p, subcategory: e.target.value as 'Interiors' | 'Exteriors' }))}>
                <option value="Interiors">Interiores</option>
                <option value="Exteriors">Exteriores</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Image</label>
            <div className="flex gap-3 items-start">
              {form.image && (
                <img src={form.image} alt="" className="w-20 h-20 object-cover rounded border border-border-custom" />
              )}
              <div className="flex-1">
                <input className={inputClass + ' mb-2'} value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="URL de imagen o subir" required />
                <label className="flex items-center gap-2 px-4 py-2 border border-border-custom rounded cursor-pointer hover:border-accent transition-colors text-sm text-text-secondary w-fit">
                  <Image size={16} />
                  {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'image')} />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Video (optional)</label>
            <div className="flex gap-3 items-start">
              {form.video && (
                <div className="w-32">
                  <VideoPlayer src={form.video} poster={form.image} className="aspect-video" />
                </div>
              )}
              <div className="flex-1">
                <input className={inputClass + ' mb-2'} value={form.video} onChange={e => setForm(p => ({ ...p, video: e.target.value }))} placeholder="URL de vídeo o subir" />
                <label className="flex items-center gap-2 px-4 py-2 border border-border-custom rounded cursor-pointer hover:border-accent transition-colors text-sm text-text-secondary w-fit">
                  <Film size={16} />
                  {uploadingVideo ? 'Subiendo...' : 'Subir vídeo'}
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
              <label className={labelClass}>Order</label>
              <input type="number" className={inputClass} value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-accent" />
            <span className="text-sm text-text-primary">Featured on homepage</span>
          </label>

          <div className="pt-4 flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-text-primary text-bg-primary text-sm font-medium rounded hover:bg-accent transition-colors">
              {mode === 'edit' ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => { setMode('list'); setForm(emptyForm); }} className="px-6 py-2.5 border border-border-custom text-text-secondary text-sm rounded hover:border-text-secondary transition-colors">
              Cancelar
            </button>
          </div>
        </form>
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
                <th className="text-left px-6 py-3">Multimedia</th>
                <th className="text-left px-6 py-3">Orden</th>
                <th className="text-left px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {projects.map((project) => (
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
                        <Image size={12} /> Image
                      </span>
                      {project.video && (
                        <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded flex items-center gap-1">
                          <Film size={12} /> Video
                        </span>
                      )}
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
                          <button onClick={() => { remove(project.id); setDeleteConfirm(null); }} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition-colors">Confirm</button>
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
