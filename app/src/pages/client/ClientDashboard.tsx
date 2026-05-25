import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import {
  FolderOpen, Upload, Clock, MessageSquare, Image as ImageIcon,
  Film, Loader2, ChevronRight, Calendar, User, LayoutList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoPlayer from '@/components/VideoPlayer';

export default function ClientDashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Fetch the logged-in client's real projects
  const { data: myProjects, isLoading } = trpc.client.getMyProjects.useQuery();

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'todo' | 'images' | 'comments' | 'hours'>('todo');
  const [uploading, setUploading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  // Mutations for client collaborative features
  const addMediaMutation = trpc.client.addProjectMedia.useMutation({
    onSuccess: () => {
      utils.client.getMyProjects.invalidate();
      toast.success('Archivo subido correctamente a tu proyecto');
    },
    onError: (err) => toast.error(err.message),
  });

  const createCommentMutation = trpc.client.createComment.useMutation({
    onSuccess: () => {
      utils.client.getMyProjects.invalidate();
      toast.success('Comentario enviado');
      setNewComment('');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileUpload = async (projectId: number, file: File) => {
    setUploading(true);
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
            visible: true, // Visible immediately
          });
        } else {
          toast.error(data.error || 'Error al procesar archivo');
        }
      } else {
        toast.error('Error al cargar archivo');
      }
    } catch {
      toast.error('Error de red al cargar archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = (projectId: number) => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate({
      projectId,
      content: newComment.trim(),
      visible: true, // Visible immediately in timeline
    });
  };

  const selectedProject = myProjects?.find((p) => p.id === selectedProjectId);

  const inputClass = "w-full h-11 bg-bg-primary border border-border-custom rounded px-3 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
  const textareaClass = "w-full bg-bg-primary border border-border-custom rounded px-3 py-2 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors min-h-[80px] resize-y";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const projectCount = myProjects?.length ?? 0;
  const totalMedia = myProjects?.reduce((sum, p) => sum + (p.media?.length ?? 0), 0) ?? 0;
  const totalHours = myProjects?.reduce((sum, p) => sum + (p.timeEntries?.reduce((hSum: number, h: any) => hSum + h.hours, 0) ?? 0), 0) ?? 0;

  if (projectCount === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display text-text-primary">Panel de Cliente</h1>
          <p className="text-text-secondary mt-1">Bienvenido, {user?.name || user?.email}</p>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-12 text-center max-w-xl mx-auto mt-8">
          <FolderOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary font-medium">Aún no tienes proyectos de avance asignados.</p>
          <p className="text-xs text-text-muted mt-2">
            Contacta con tu arquitecto o diseñador asignado para que vincule tu ficha de cliente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-text-primary">Panel de Cliente</h1>
        <p className="text-sm text-text-secondary mt-1">Bienvenido a tu espacio de seguimiento técnico, {user?.name || user?.email}</p>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <FolderOpen size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-text-primary">{projectCount}</p>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Proyectos Activos</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ImageIcon size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-text-primary">{totalMedia}</p>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Archivos de Avance</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-text-primary">{totalHours} hrs</p>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Horas de Dedicación</p>
          </div>
        </div>
      </div>

      {/* Projects List Card */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
        <h2 className="text-lg font-display text-text-primary mb-4">Selecciona un Proyecto para Ver Avances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProjects?.map((project) => {
            const isSelected = selectedProjectId === project.id;
            const projectMedia = project.media ?? [];
            const coverImage = projectMedia.find(m => m.type === 'image')?.url || '/placeholder.png';
            return (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(isSelected ? null : project.id);
                  setActiveTab('todo');
                }}
                className={`relative text-left border rounded-xl overflow-hidden transition-all duration-200 ${
                  isSelected
                    ? 'border-accent ring-1 ring-accent'
                    : 'border-border-custom hover:border-text-secondary bg-bg-primary/20'
                }`}
              >
                <div className="aspect-video relative bg-bg-primary">
                  {coverImage !== '/placeholder.png' ? (
                    <img src={coverImage} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted bg-bg-tertiary">
                      <FolderOpen size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/35" />
                  {projectMedia.length > 0 && (
                    <div className="absolute top-2 right-2 bg-bg-primary/95 text-text-primary text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-border-custom">
                      {projectMedia.length} archivos
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary text-sm truncate">{project.name}</h3>
                    <ChevronRight size={16} className={`transition-transform duration-200 ${isSelected ? 'rotate-90 text-accent' : 'text-text-muted'}`} />
                  </div>
                  {project.description && (
                    <p className="text-xs text-text-muted mt-1 truncate">{project.description}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Project Detailed Views */}
      {selectedProject && (
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6 space-y-6">
          {/* Project Title Block */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-custom pb-4">
            <div>
              <h2 className="text-xl font-display text-text-primary">{selectedProject.name}</h2>
              {selectedProject.description && (
                <p className="text-sm text-text-secondary mt-1">{selectedProject.description}</p>
              )}
            </div>
            {/* Quick direct uploads */}
            <label className="flex items-center gap-2 px-4 py-2 bg-bg-primary hover:border-accent border border-border-custom rounded cursor-pointer transition-colors text-xs text-text-secondary select-none font-semibold">
              <Upload size={14} />
              {uploading ? 'Subiendo...' : 'Enviar Imagen/Video'}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(selectedProject.id, e.target.files[0])}
              />
            </label>
          </div>

          {/* Detailed project tabs */}
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
                {tab === 'images' && <ImageIcon size={13} className="inline mr-1" />}
                {tab === 'comments' && <MessageSquare size={13} className="inline mr-1" />}
                {tab === 'hours' && <Clock size={13} className="inline mr-1" />}
                {tab === 'todo' ? 'Todo' : tab === 'images' ? 'Imágenes' : tab === 'comments' ? 'Comentarios' : 'Horas'}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          {activeTab === 'todo' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Línea de Tiempo del Proyecto</h3>
              
              {/* Chronological Activities */}
              {(() => {
                const activityItems = [
                  ...(selectedProject.comments || []).map((c: any) => ({ type: 'comment', id: c.id, data: c, date: new Date(c.createdAt) })),
                  ...(selectedProject.timeEntries || []).map((t: any) => ({ type: 'time', id: t.id, data: t, date: new Date(t.date) }))
                ].sort((a, b) => b.date.getTime() - a.date.getTime());

                if (activityItems.length === 0) {
                  return <p className="text-xs text-text-muted py-4">No hay avances ni comentarios en este proyecto todavía.</p>;
                }

                return (
                  <div className="space-y-3">
                    {activityItems.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="border border-border-custom rounded-lg p-4 bg-bg-primary/20">
                        <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            item.type === 'comment' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {item.type === 'comment' ? 'Comentario' : 'Horas de Trabajo'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {item.date.toLocaleDateString()}
                          </span>
                        </div>

                        {item.type === 'comment' ? (
                          <div className="flex gap-2 items-start">
                            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
                              <User size={12} />
                            </div>
                            <p className="text-sm text-text-primary mt-0.5">{item.data.content}</p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text-primary">{item.data.description}</span>
                              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Dedicado
                              </span>
                            </div>
                            <p className="text-xs text-text-muted mt-1">{item.data.hours} horas dedicadas a esta etapa.</p>
                            {item.data.notes && (
                              <p className="text-xs text-amber-500/80 bg-amber-500/5 rounded p-2 mt-2 border border-amber-500/10">
                                <span className="font-semibold">Notas:</span> {item.data.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Archivos e Imágenes de Avance</h3>
              </div>

              {selectedProject.media?.length === 0 ? (
                <p className="text-xs text-text-muted py-6 text-center bg-bg-primary/10 border border-border-custom border-dashed rounded-lg">
                  Tu arquitecto/diseñador no ha subido imágenes todavía. Puedes subir referencias usando el botón arriba.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {selectedProject.media?.map((m: any) => (
                    <div
                      key={m.id}
                      onClick={() => setPreviewAsset({ url: m.url, type: m.type })}
                      className="group relative aspect-video bg-bg-primary rounded-lg border border-border-custom overflow-hidden cursor-pointer hover:border-accent transition-colors"
                    >
                      {m.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center text-accent bg-bg-tertiary">
                          <Film size={24} />
                        </div>
                      ) : (
                        <img src={m.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Enviar Comentario al Diseñador</h3>
              <div className="space-y-2">
                <textarea
                  className={textareaClass}
                  placeholder="Escribe aquí tus comentarios, sugerencias o dudas sobre el avance..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  onClick={() => handleAddComment(selectedProject.id)}
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  className="bg-accent text-white px-4 h-9 text-xs"
                >
                  {createCommentMutation.isPending ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Detalle del Tiempo Dedicado</h3>
              {selectedProject.timeEntries?.length === 0 ? (
                <p className="text-xs text-text-muted">No se han registrado partes de horas todavía.</p>
              ) : (
                <div className="bg-bg-primary/20 border border-border-custom rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border-custom text-text-muted uppercase text-xs tracking-wider bg-bg-primary/45">
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Descripción</th>
                        <th className="px-4 py-3 text-right">Horas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-custom">
                      {selectedProject.timeEntries?.map((entry: any) => (
                        <tr key={entry.id} className="hover:bg-bg-tertiary/20">
                          <td className="px-4 py-3 text-xs text-text-muted">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-text-primary font-medium">
                            {entry.description}
                          </td>
                          <td className="px-4 py-3 text-right text-accent font-semibold">
                            {entry.hours} hrs
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(18, 18, 18, 0.96)', backdropFilter: 'blur(8px)' }}
          onClick={() => setPreviewAsset(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute -top-10 right-0 text-text-secondary hover:text-text-primary text-xl transition-colors"
            >
              ✕
            </button>
            {previewAsset.type === 'video' ? (
              <VideoPlayer src={previewAsset.url} className="w-full max-h-[75vh] aspect-video" />
            ) : (
              <img src={previewAsset.url} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded border border-border-custom bg-black" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
