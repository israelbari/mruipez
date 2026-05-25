import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import {
  ChevronLeft, Pencil, Trash2, Plus, X, Image, Film, Clock, MessageSquare,
  Eye, EyeOff, Save, Loader2, LayoutList, Calendar, DollarSign, Share2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  // Queries
  const { data: client, isLoading: isClientLoading } = trpc.client.getClient.useQuery({ id: clientId });
  const { data: projects, isLoading: isProjectsLoading } = trpc.client.getClientProjects.useQuery({ clientId });

  // Mutations
  const updateClientStatusMutation = trpc.auth.updateUser.useMutation({
    onSuccess: () => {
      utils.client.getClient.invalidate({ id: clientId });
      toast.success('Estado del cliente actualizado');
    },
  });

  const createProjectMutation = trpc.client.createProject.useMutation({
    onSuccess: () => {
      utils.client.getClientProjects.invalidate({ clientId });
      toast.success('Proyecto creado correctamente');
      setNewProjectName('');
    },
  });

  const deleteProjectMutation = trpc.client.deleteProject.useMutation({
    onSuccess: () => {
      utils.client.getClientProjects.invalidate({ clientId });
      toast.success('Proyecto eliminado');
    },
  });

  const updateProjectMutation = trpc.client.updateProject.useMutation({
    onSuccess: () => {
      utils.client.getClientProjects.invalidate({ clientId });
      toast.success('Proyecto actualizado');
      setEditingProject(null);
    },
  });

  const createCommentMutation = trpc.client.createComment.useMutation({
    onSuccess: () => {
      utils.client.getClientProjects.invalidate({ clientId });
      toast.success('Comentario añadido');
    },
  });

  const deleteCommentMutation = trpc.client.deleteComment.useMutation({
    onSuccess: () => {
      utils.client.getClientProjects.invalidate({ clientId });
      toast.success('Comentario eliminado');
    },
  });

  const toggleCommentVisibilityMutation = trpc.client.toggleCommentVisibility.useMutation({
    onSuccess: () => utils.client.getClientProjects.invalidate({ clientId }),
  });

  const createTimeMutation = trpc.client.createTimeEntry.useMutation({
    onSuccess: () => {
      utils.client.getClientProjects.invalidate({ clientId });
      toast.success('Horas registradas');
    },
  });

  const deleteTimeMutation = trpc.client.deleteTimeEntry.useMutation({
    onSuccess: () => {
      utils.client.getClientProjects.invalidate({ clientId });
      toast.success('Registro de horas eliminado');
    },
  });

  const toggleTimeVisibilityMutation = trpc.client.toggleTimeVisibility.useMutation({
    onSuccess: () => utils.client.getClientProjects.invalidate({ clientId }),
  });

  const addMediaMutation = trpc.client.addProjectMedia.useMutation({
    onSuccess: () => {
      utils.client.getClientProjects.invalidate({ clientId });
      toast.success('Archivo subido al proyecto');
    },
  });

  const deleteMediaMutation = trpc.client.deleteProjectMedia.useMutation({
    onSuccess: () => {
      utils.client.getClientProjects.invalidate({ clientId });
      toast.success('Archivo eliminado del proyecto');
    },
  });

  const toggleMediaVisibilityMutation = trpc.client.toggleMediaVisibility.useMutation({
    onSuccess: () => utils.client.getClientProjects.invalidate({ clientId }),
  });

  const publishMutation = trpc.client.publishToPortfolio.useMutation({
    onSuccess: () => {
      toast.success('¡Proyecto publicado en el Portfolio público!');
      setIsPublishOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  // State
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDesc, setEditProjectDesc] = useState('');

  // Repeating form states
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [timeForm, setTimeForm] = useState<Record<number, { description: string; hours: string; notes: string; date: string; billable: boolean }>>({});

  // Publish Dialog State
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    name: '',
    category: 'Residential' as 'Residential' | 'Commercial',
    subcategory: 'Interiors' as 'Interiors' | 'Exteriors',
    image: '',
    aspect: '16:9' as '16:9' | '3:4' | '4:5',
    assets: [] as string[],
  });

  const [uploading, setUploading] = useState<Record<number, boolean>>({});

  const handleFileUpload = async (projectId: number, file: File) => {
    setUploading((prev) => ({ ...prev, [projectId]: true }));
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const type = file.type.startsWith('video/') ? 'video' : 'image';
          addMediaMutation.mutate({
            projectId,
            url: data.url,
            type,
            visible: true,
          });
        }
      } else {
        toast.error('Error al cargar archivo');
      }
    } catch {
      toast.error('Error de red al cargar archivo');
    } finally {
      setUploading((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishForm.name.trim() || !publishForm.image.trim()) {
      toast.error('Nombre e imagen son obligatorios');
      return;
    }
    publishMutation.mutate(publishForm);
  };

  const openPublishDialog = (projectName: string, coverImage: string, allImages: string[]) => {
    setPublishForm({
      name: projectName,
      category: 'Residential',
      subcategory: 'Interiors',
      image: coverImage,
      aspect: '16:9',
      assets: allImages,
    });
    setIsPublishOpen(true);
  };

  const inputClass = "w-full h-11 bg-bg-primary border border-border-custom rounded px-3 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
  const textareaClass = "w-full bg-bg-primary border border-border-custom rounded px-3 py-2 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors min-h-[80px] resize-y";
  const labelClass = "text-xs uppercase tracking-wider text-text-secondary block mb-2";

  if (isClientLoading || isProjectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Cliente no encontrado</p>
        <Link to="/admin/clients" className="text-accent underline mt-4 inline-block">Volver a clientes</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Link to="/admin/clients" className="hover:text-text-primary transition-colors flex items-center gap-1">
          <ChevronLeft size={14} /> Clientes
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">{client.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-custom pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-lg font-bold">
            {client.name?.charAt(0) ?? client.email.charAt(0)}
          </div>
          <div>
            <h1 className="font-display text-text-primary text-3xl">{client.name}</h1>
            <p className="text-sm text-text-secondary">{client.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">{client.isActive ? 'Activo' : 'Inactivo'}</span>
          <Switch
            checked={client.isActive}
            onCheckedChange={(checked) => updateClientStatusMutation.mutate({ id: client.id, isActive: checked })}
          />
        </div>
      </div>

      {/* Create project */}
      <div className="bg-bg-secondary border border-border-custom rounded-lg p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-3">Nuevo Proyecto de Cliente</h3>
        <div className="flex gap-2">
          <input
            className={inputClass + " flex-1 h-10"}
            placeholder="Ej: Reforma Planta Baja"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <button
            onClick={() => {
              if (newProjectName.trim()) {
                createProjectMutation.mutate({ clientId: client.id, name: newProjectName.trim() });
              }
            }}
            disabled={createProjectMutation.isPending || !newProjectName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-text-primary text-bg-primary text-sm font-medium rounded hover:bg-accent transition-colors disabled:opacity-40"
          >
            <Plus size={16} /> Crear Proyecto
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        <h2 className="text-xl font-display text-text-primary border-b border-border-custom pb-2">Proyectos Activos</h2>
        {projects?.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border-custom rounded-lg">
            <p className="text-sm text-text-secondary">Este cliente aún no tiene proyectos asignados.</p>
          </div>
        ) : (
          projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              editingProject={editingProject}
              setEditingProject={setEditingProject}
              editProjectName={editProjectName}
              setEditProjectName={setEditProjectName}
              editProjectDesc={editProjectDesc}
              setEditProjectDesc={setEditProjectDesc}
              updateProjectMutation={updateProjectMutation}
              deleteProjectMutation={deleteProjectMutation}
              commentText={commentText}
              setCommentText={setCommentText}
              createCommentMutation={createCommentMutation}
              deleteCommentMutation={deleteCommentMutation}
              toggleCommentVisibilityMutation={toggleCommentVisibilityMutation}
              timeForm={timeForm}
              setTimeForm={setTimeForm}
              createTimeMutation={createTimeMutation}
              deleteTimeMutation={deleteTimeMutation}
              toggleTimeVisibilityMutation={toggleTimeVisibilityMutation}
              handleFileUpload={handleFileUpload}
              uploading={uploading}
              deleteMediaMutation={deleteMediaMutation}
              toggleMediaVisibilityMutation={toggleMediaVisibilityMutation}
              openPublishDialog={openPublishDialog}
              inputClass={inputClass}
              textareaClass={textareaClass}
              labelClass={labelClass}
            />
          ))
        )}
      </div>

      {/* Publish to Portfolio Dialog */}
      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogContent className="bg-bg-secondary border-border-custom text-text-primary max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-text-primary font-display text-xl">
              Publicar en el Portfolio Público
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePublish} className="space-y-4 py-4">
            <div>
              <label className={labelClass}>Nombre del Proyecto en Portfolio</label>
              <input
                className={inputClass}
                value={publishForm.name}
                onChange={(e) => setPublishForm({ ...publishForm, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Categoría</label>
                <select
                  className={inputClass}
                  value={publishForm.category}
                  onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value as any })}
                >
                  <option value="Residential">Residencial</option>
                  <option value="Commercial">Comercial</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Subcategoría</label>
                <select
                  className={inputClass}
                  value={publishForm.subcategory}
                  onChange={(e) => setPublishForm({ ...publishForm, subcategory: e.target.value as any })}
                >
                  <option value="Interiors">Interiores</option>
                  <option value="Exteriors">Exteriores</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Aspect Ratio</label>
                <select
                  className={inputClass}
                  value={publishForm.aspect}
                  onChange={(e) => setPublishForm({ ...publishForm, aspect: e.target.value as any })}
                >
                  <option value="16:9">Horizontal (16:9)</option>
                  <option value="3:4">Vertical (3:4)</option>
                  <option value="4:5">Vertical (4:5)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Portada Seleccionada</label>
                <div className="w-full h-11 border border-border-custom rounded flex items-center px-3 text-xs truncate bg-bg-primary">
                  {publishForm.image}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Imagenes que se importarán ({publishForm.assets.length})</label>
              <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto p-1 border border-border-custom rounded bg-bg-primary">
                {publishForm.assets.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded border border-border-custom overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsPublishOpen(false)} className="text-text-secondary">
                Cancelar
              </Button>
              <Button type="submit" disabled={publishMutation.isPending} className="bg-accent text-white hover:bg-accent/90">
                {publishMutation.isPending ? 'Publicando...' : 'Publicar Ahora'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Project Card Helper Component
function ProjectCard({
  project, editingProject, setEditingProject, editProjectName, setEditProjectName, editProjectDesc, setEditProjectDesc,
  updateProjectMutation, deleteProjectMutation, commentText, setCommentText, createCommentMutation, deleteCommentMutation,
  toggleCommentVisibilityMutation, timeForm, setTimeForm, createTimeMutation, deleteTimeMutation, toggleTimeVisibilityMutation,
  handleFileUpload, uploading, deleteMediaMutation, toggleMediaVisibilityMutation, openPublishDialog,
  inputClass, textareaClass, labelClass
}: any) {
  const [activeTab, setActiveTab] = useState<'todo' | 'images' | 'comments' | 'hours'>('todo');

  const onAddComment = () => {
    const text = commentText[project.id];
    if (!text?.trim()) return;
    createCommentMutation.mutate({ projectId: project.id, content: text.trim(), visible: true });
    setCommentText((prev: any) => ({ ...prev, [project.id]: '' }));
  };

  const onAddTime = () => {
    const form = timeForm[project.id] || { description: '', hours: '', notes: '', date: '', billable: true };
    if (!form.description?.trim() || !form.hours) return;
    createTimeMutation.mutate({
      projectId: project.id,
      description: form.description.trim(),
      hours: Number(form.hours),
      notes: form.notes?.trim() || undefined,
      date: form.date || undefined,
      visible: true,
      billable: form.billable !== false,
    });
    setTimeForm((prev: any) => ({
      ...prev,
      [project.id]: { description: '', hours: '', notes: '', date: '', billable: true }
    }));
  };

  const getFormState = () => {
    return timeForm[project.id] || { description: '', hours: '', notes: '', date: '', billable: true };
  };

  const setFormState = (updates: any) => {
    setTimeForm((prev: any) => ({
      ...prev,
      [project.id]: { ...getFormState(), ...updates }
    }));
  };

  const imagesOnly = project.media?.filter((m: any) => m.type === 'image') || [];
  const coverImage = imagesOnly[0]?.url || '';
  const allImages = imagesOnly.map((m: any) => m.url);

  // Activity feed items merged chronologically
  const activityItems = [
    ...(project.comments || []).map((c: any) => ({ type: 'comment', id: c.id, data: c, date: new Date(c.createdAt) })),
    ...(project.timeEntries || []).map((t: any) => ({ type: 'time', id: t.id, data: t, date: new Date(t.date) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="bg-bg-secondary border border-border-custom rounded-lg p-6 space-y-5">
      {/* Project Header */}
      <div className="flex items-start justify-between border-b border-border-custom pb-3">
        {editingProject === project.id ? (
          <div className="flex-1 space-y-3">
            <input
              className={inputClass + " h-9"}
              value={editProjectName}
              onChange={(e) => setEditProjectName(e.target.value)}
              placeholder="Nombre del proyecto"
            />
            <textarea
              className={textareaClass}
              value={editProjectDesc}
              onChange={(e) => setEditProjectDesc(e.target.value)}
              placeholder="Descripción del proyecto"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => updateProjectMutation.mutate({ id: project.id, name: editProjectName, description: editProjectDesc })}
                disabled={updateProjectMutation.isPending}
                className="bg-accent text-white h-8 text-xs px-3"
              >
                Guardar
              </Button>
              <Button
                variant="ghost"
                onClick={() => setEditingProject(null)}
                className="h-8 text-xs px-3 text-text-secondary"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-display text-text-primary">{project.name}</h3>
            {project.description && <p className="text-sm text-text-secondary mt-1">{project.description}</p>}
            <div className="flex gap-3 text-xs text-text-muted mt-2">
              <span>{project.media?.length ?? 0} archivos</span>
              <span>•</span>
              <span>{project.comments?.length ?? 0} comentarios</span>
              <span>•</span>
              <span>{project.timeEntries?.reduce((sum: number, t: any) => sum + t.hours, 0) ?? 0} horas</span>
            </div>
          </div>
        )}

        {!editingProject && (
          <div className="flex gap-2">
            <button
              onClick={() => openPublishDialog(project.name, coverImage, allImages)}
              disabled={allImages.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 hover:bg-accent text-accent hover:text-white rounded text-xs transition-colors disabled:opacity-40 disabled:pointer-events-none"
              title="Publicar todo este proyecto en el Portfolio público"
            >
              <Share2 size={13} /> Publicar en Portfolio
            </button>
            <button
              onClick={() => {
                setEditingProject(project.id);
                setEditProjectName(project.name);
                setEditProjectDesc(project.description || '');
              }}
              className="p-2 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary rounded transition-colors"
              title="Editar proyecto"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => {
                if (confirm('¿Eliminar este proyecto y todo su contenido?')) {
                  deleteProjectMutation.mutate({ id: project.id });
                }
              }}
              className="p-2 hover:bg-red-500/10 text-text-secondary hover:text-red-400 rounded transition-colors"
              title="Eliminar proyecto"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-custom">
        {(['todo', 'images', 'comments', 'hours'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab === 'todo' && <LayoutList size={13} className="inline mr-1" />}
            {tab === 'images' && <Image size={13} className="inline mr-1" />}
            {tab === 'comments' && <MessageSquare size={13} className="inline mr-1" />}
            {tab === 'hours' && <Clock size={13} className="inline mr-1" />}
            {tab === 'todo' ? 'Todo' : tab === 'images' ? 'Imágenes' : tab === 'comments' ? 'Comentarios' : 'Horas'}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'todo' && (
        <div className="space-y-5">
          {/* Quick buttons */}
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-3 py-1.5 bg-bg-primary hover:border-accent border border-border-custom rounded cursor-pointer transition-colors text-xs text-text-secondary">
              <Image size={14} />
              {uploading[project.id] ? 'Subiendo...' : 'Subir Imagen/Video'}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(project.id, e.target.files[0])}
              />
            </label>
            <button
              onClick={() => setActiveTab('comments')}
              className="flex items-center gap-2 px-3 py-1.5 bg-bg-primary hover:border-accent border border-border-custom rounded transition-colors text-xs text-text-secondary"
            >
              <MessageSquare size={14} /> Añadir Comentario
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className="flex items-center gap-2 px-3 py-1.5 bg-bg-primary hover:border-accent border border-border-custom rounded transition-colors text-xs text-text-secondary"
            >
              <Clock size={14} /> Registrar Horas
            </button>
          </div>

          {/* Activity feed list */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Línea de Tiempo del Proyecto</h4>
            {activityItems.length === 0 ? (
              <p className="text-xs text-text-muted">Aún no hay actividad registrada en este proyecto.</p>
            ) : (
              activityItems.map((item: any) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`border border-border-custom rounded-lg p-3 bg-bg-primary/20 ${
                    item.data.visible ? 'border-border-custom' : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        item.type === 'comment' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {item.type === 'comment' ? 'Comentario' : 'Horas'}
                      </span>
                      <span className="text-text-muted flex items-center gap-1">
                        <Calendar size={11} /> {item.date.toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (item.type === 'comment') {
                          toggleCommentVisibilityMutation.mutate({ id: item.data.id, visible: !item.data.visible });
                        } else {
                          toggleTimeVisibilityMutation.mutate({ id: item.data.id, visible: !item.data.visible });
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        item.data.visible ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                      title={item.data.visible ? 'Visible en el portal de cliente' : 'Oculto para el cliente'}
                    >
                      {item.data.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      {item.data.visible ? 'Visible' : 'Oculto'}
                    </button>
                  </div>

                  {item.type === 'comment' ? (
                    <div>
                      <p className="text-sm text-text-primary">{item.data.content}</p>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => deleteCommentMutation.mutate({ id: item.data.id })}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-primary font-medium">{item.data.description}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                          item.data.billable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-bg-tertiary text-text-secondary'
                        }`}>
                          {item.data.billable ? 'Facturable' : 'No Facturable'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">{item.data.hours} horas cargadas.</p>
                      {item.data.notes && <p className="text-xs text-amber-500/80 bg-amber-500/5 rounded p-2 mt-1 border border-amber-500/10"><span className="font-semibold">Nota:</span> {item.data.notes}</p>}
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => deleteTimeMutation.mutate({ id: item.data.id })}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'images' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-custom pb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Archivos de Avance ({project.media?.length ?? 0})</span>
            <label className="flex items-center gap-2 px-3 py-1.5 bg-bg-primary hover:border-accent border border-border-custom rounded cursor-pointer transition-colors text-xs text-text-secondary">
              <Plus size={14} />
              {uploading[project.id] ? 'Subiendo...' : 'Añadir Archivo'}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(project.id, e.target.files[0])}
              />
            </label>
          </div>

          {project.media?.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">No hay imágenes ni videos asignados a este proyecto.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {project.media?.map((m: any) => (
                <div key={m.id} className={`group relative aspect-video bg-bg-primary rounded-lg border border-border-custom overflow-hidden ${
                  m.visible ? '' : 'opacity-60 border-red-500/20'
                }`}>
                  {m.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center text-accent">
                      <Film size={28} />
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleMediaVisibilityMutation.mutate({ id: m.id, visible: !m.visible })}
                      className={`p-1.5 rounded-full text-white transition-colors ${m.visible ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                      title={m.visible ? 'Visible para cliente' : 'Oculto para cliente'}
                    >
                      {m.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    {m.type === 'image' && (
                      <button
                        onClick={() => openPublishDialog(project.name, m.url, [m.url])}
                        className="p-1.5 rounded-full bg-accent text-white hover:bg-accent/90"
                        title="Exportar y publicar esta foto en el Portfolio"
                      >
                        <Share2 size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMediaMutation.mutate({ id: m.id })}
                      className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600"
                      title="Eliminar archivo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {!m.visible && (
                    <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded leading-none">
                      Oculto
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Agregar Comentario para el Cliente</h4>
          <div className="space-y-2">
            <textarea
              className={textareaClass}
              placeholder="Escribe un mensaje de avance, consultas o especificaciones..."
              value={commentText[project.id] || ''}
              onChange={(e) => setCommentText((prev: any) => ({ ...prev, [project.id]: e.target.value }))}
            />
            <Button
              onClick={onAddComment}
              disabled={!commentText[project.id]?.trim()}
              className="bg-accent text-white px-4 h-9 text-xs"
            >
              Publicar Comentario
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'hours' && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Bitácora de Tiempos y Partes de Horas</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg-primary/20 border border-border-custom rounded-lg p-4">
            <div className="col-span-2">
              <label className="text-[10px] uppercase text-text-secondary block mb-1">Descripción del Trabajo</label>
              <input
                className={inputClass + " h-9"}
                placeholder="Ej: Modelado 3D de cocina"
                value={getFormState().description}
                onChange={(e) => setFormState({ description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-text-secondary block mb-1">Horas dedicadas</label>
              <input
                type="number"
                step="0.5"
                className={inputClass + " h-9"}
                placeholder="2.5"
                value={getFormState().hours}
                onChange={(e) => setFormState({ hours: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-text-secondary block mb-1">Fecha</label>
              <input
                type="date"
                className={inputClass + " h-9 text-xs"}
                value={getFormState().date}
                onChange={(e) => setFormState({ date: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase text-text-secondary block mb-1">Notas internas (Opcional)</label>
              <input
                className={inputClass + " h-9"}
                placeholder="Ej: Pendiente de revisar texturas"
                value={getFormState().notes}
                onChange={(e) => setFormState({ notes: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-text-primary">
                <input
                  type="checkbox"
                  checked={getFormState().billable}
                  onChange={(e) => setFormState({ billable: e.target.checked })}
                  className="w-4 h-4 accent-accent"
                />
                Trabajo Facturable
              </label>
              <Button
                onClick={onAddTime}
                disabled={!getFormState().description || !getFormState().hours}
                className="bg-accent text-white px-4 h-9 text-xs"
              >
                Agregar Horas
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
