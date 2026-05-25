import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import {
  FolderOpen, Upload, Clock, CheckCircle, XCircle, Eye,
  Image, Film, Loader2, ChevronRight
} from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

export default function ClientDashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: allProjects } = trpc.project.list.useQuery();
  const { data: myUploads } = trpc.upload.myUploads.useQuery();
  const getPresignedUrlMutation = trpc.upload.getPresignedUrl.useMutation();
  const createUploadMutation = trpc.upload.create.useMutation({
    onSuccess: () => {
      utils.upload.myUploads.invalidate();
      toast.success('Archivo subido correctamente');
    },
    onError: (err) => toast.error(err.message),
  });

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  // Get assigned project IDs from user roles
  const assignedProjectIds = useMemo(() => {
    if (!user?.roles) return [];
    return user.roles
      .filter((r) => r.role === 'client' && r.scope === 'project' && r.projectId)
      .map((r) => r.projectId!);
  }, [user]);

  const assignedProjects = useMemo(() => {
    return (allProjects ?? []).filter((p) => assignedProjectIds.includes(p.id));
  }, [allProjects, assignedProjectIds]);

  const selectedProject = assignedProjects.find((p) => p.id === selectedProjectId);

  const handleFileUpload = async (file: File, projectId: number) => {
    setUploading(true);
    try {
      const presigned = await getPresignedUrlMutation.mutateAsync({
        filename: file.name,
        fileType: file.type,
        isVideo: file.type.startsWith('video/'),
      });

      let url = '';
      if (presigned.useFallback) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          url = data.url;
        }
      } else {
        const res = await fetch(presigned.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (res.ok) url = presigned.publicUrl;
      }

      if (url) {
        await createUploadMutation.mutateAsync({
          projectId,
          filename: file.name,
          url,
          type: file.type.startsWith('video/') ? 'video' : 'image',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const projectUploads = (uploadId: number) =>
    (myUploads ?? []).filter((u) => u.projectId === uploadId);

  if (assignedProjects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-light text-text-primary">Panel de Cliente</h1>
          <p className="text-text-secondary mt-1">Bienvenido, {user?.name || user?.email}</p>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-12 text-center">
          <FolderOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Aún no tienes proyectos asignados.</p>
          <p className="text-sm text-text-muted mt-2">
            Contacta con el administrador para que te asigne proyectos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-text-primary">Panel de Cliente</h1>
        <p className="text-text-secondary mt-1">Bienvenido, {user?.name || user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <FolderOpen size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-light text-text-primary">{assignedProjects.length}</p>
              <p className="text-sm text-text-secondary">Proyectos asignados</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Upload size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-light text-text-primary">{myUploads?.length ?? 0}</p>
              <p className="text-sm text-text-secondary">Uploads realizados</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Clock size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-light text-text-primary">
                {myUploads?.filter((u) => u.status === 'pending').length ?? 0}
              </p>
              <p className="text-sm text-text-secondary">Pendientes de aprobación</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Selector */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
        <h2 className="text-lg font-medium text-text-primary mb-4">Tus Proyectos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedProjects.map((project) => {
            const isSelected = selectedProjectId === project.id;
            const uploads = projectUploads(project.id);
            return (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(isSelected ? null : project.id)}
                className={`relative text-left border rounded-xl overflow-hidden transition-all ${
                  isSelected
                    ? 'border-accent ring-1 ring-accent'
                    : 'border-border-custom hover:border-text-secondary'
                }`}
              >
                <div className="aspect-video relative">
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-bg-primary/30" />
                  {uploads.length > 0 && (
                    <div className="absolute top-2 right-2 bg-bg-primary/80 text-text-primary text-xs px-2 py-1 rounded">
                      {uploads.length} uploads
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-text-primary">{project.name}</h3>
                    <ChevronRight size={16} className={`transition-transform ${isSelected ? 'rotate-90 text-accent' : 'text-text-muted'}`} />
                  </div>
                  <p className="text-xs text-text-muted mt-1">{project.category} / {project.subcategory}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Project Detail */}
      {selectedProject && (
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-text-primary">{selectedProject.name}</h2>
            <label className="flex items-center gap-2 px-4 py-2 border border-border-custom rounded cursor-pointer hover:border-accent transition-colors text-sm text-text-secondary">
              <Upload size={16} />
              {uploading ? 'Subiendo...' : 'Subir archivo'}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, selectedProject.id);
                }}
              />
            </label>
          </div>

          {/* Assets */}
          {selectedProject.assets && selectedProject.assets.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Assets del proyecto</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedProject.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="relative aspect-video bg-bg-tertiary rounded border border-border-custom overflow-hidden cursor-pointer group"
                    onClick={() => setPreviewAsset({ url: asset.url, type: asset.type })}
                  >
                    {asset.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={20} className="text-accent" />
                      </div>
                    ) : (
                      <img src={asset.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploads */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Tus uploads</h3>
            {projectUploads(selectedProject.id).length === 0 ? (
              <p className="text-sm text-text-muted">No has subido archivos a este proyecto.</p>
            ) : (
              <div className="space-y-2">
                {projectUploads(selectedProject.id).map((upload) => (
                  <div key={upload.id} className="flex items-center gap-3 p-3 bg-bg-primary border border-border-custom rounded">
                    {upload.type === 'video' ? <Film size={16} className="text-accent" /> : <Image size={16} className="text-accent" />}
                    <span className="text-sm text-text-primary flex-1 truncate">{upload.filename}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        upload.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : upload.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {upload.status === 'approved' && <CheckCircle size={10} />}
                      {upload.status === 'rejected' && <XCircle size={10} />}
                      {upload.status === 'pending' && <Clock size={10} />}
                      {upload.status}
                    </span>
                    {upload.isPublic && (
                      <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Eye size={10} /> Público
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
              ✕
            </button>
            {previewAsset.type === 'video' ? (
              <VideoPlayer src={previewAsset.url} className="w-full max-h-[75vh] aspect-video" />
            ) : (
              <img src={previewAsset.url} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
