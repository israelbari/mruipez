import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Film, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

export interface ProjectAsset {
  id: number;
  projectId?: number;
  url: string;
  type: 'image' | 'video';
  order: number;
}

export interface ProjectItem {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  video?: string | null;
  assets: ProjectAsset[];
}

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  initialProjectIndex: number;
}

export default function LightboxModal({ isOpen, onClose, projects, initialProjectIndex }: LightboxModalProps) {
  const [projectIndex, setProjectIndex] = useState(initialProjectIndex);
  const [assetIndex, setAssetIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);

  const project = projects[projectIndex];
  const sortedAssets = project?.assets ? [...project.assets].sort((a, b) => a.order - b.order) : [];
  const currentAsset = sortedAssets[assetIndex];

  // Reset asset index when project changes
  useEffect(() => {
    setAssetIndex(0);
  }, [projectIndex]);

  const goNextAsset = useCallback(() => {
    if (sortedAssets.length > 1) {
      setAssetIndex((prev) => (prev + 1) % sortedAssets.length);
    }
  }, [sortedAssets.length]);

  const goPrevAsset = useCallback(() => {
    if (sortedAssets.length > 1) {
      setAssetIndex((prev) => (prev - 1 + sortedAssets.length) % sortedAssets.length);
    }
  }, [sortedAssets.length]);

  const goNextProject = useCallback(() => {
    setProjectIndex((prev) => (prev + 1) % projects.length);
  }, [projects.length]);

  const goPrevProject = useCallback(() => {
    setProjectIndex((prev) => (prev - 1 + projects.length) % projects.length);
  }, [projects.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNextAsset();
      if (e.key === 'ArrowLeft') goPrevAsset();
      if (e.key === 'ArrowDown') goNextProject();
      if (e.key === 'ArrowUp') goPrevProject();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goNextAsset, goPrevAsset, goNextProject, goPrevProject]);

  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex"
      style={{ backgroundColor: 'rgba(18, 18, 18, 0.98)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
    >
      {/* Sidebar: Project list */}
      <div
        className={`flex-shrink-0 h-full border-r border-border-custom transition-all duration-300 overflow-hidden ${
          sidebarOpen ? 'w-72' : 'w-0 opacity-0'
        }`}
        style={{ backgroundColor: '#121212' }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border-custom">
            <h3 className="font-sans text-text-primary text-sm uppercase tracking-widest">Proyectos</h3>
            <p className="text-text-muted text-xs mt-1">{projects.length} proyectos</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {projects.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setProjectIndex(idx)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  idx === projectIndex
                    ? 'bg-accent/20 border-l-2 border-accent'
                    : 'hover:bg-bg-tertiary/50 border-l-2 border-transparent'
                }`}
              >
                <img src={p.image} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />
                <div className="min-w-0">
                  <div className={`text-sm font-medium truncate ${idx === projectIndex ? 'text-accent' : 'text-text-primary'}`}>
                    {p.name}
                  </div>
                  <div className="text-xs text-text-muted uppercase tracking-wider mt-0.5">
                    {p.category} / {p.subcategory}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <ImageIcon size={10} /> {p.assets.filter(a => a.type === 'image').length}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Film size={10} /> {p.assets.filter(a => a.type === 'video').length}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full relative" ref={mainRef}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-custom flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-secondary hover:text-text-primary transition-colors p-1"
              aria-label={sidebarOpen ? 'Ocultar proyectos' : 'Mostrar proyectos'}
            >
              {sidebarOpen ? <ChevronUp size={18} className="rotate-90" /> : <ChevronDown size={18} className="rotate-90" />}
            </button>
            <div>
              <h2 className="font-sans font-medium text-text-primary text-sm">{project.name}</h2>
              <p className="text-text-muted text-xs uppercase tracking-wider">
                {project.category} / {project.subcategory}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
            aria-label="Cerrar galería"
          >
            <X size={20} />
          </button>
        </div>

        {/* Asset viewer */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4">
          {sortedAssets.length === 0 ? (
            <div className="text-text-muted text-sm">No hay assets para este proyecto</div>
          ) : currentAsset?.type === 'video' ? (
            <div className="w-full max-w-5xl max-h-[75vh]">
              <VideoPlayer
                src={currentAsset.url}
                poster={project.image}
                className="w-full aspect-video"
              />
            </div>
          ) : (
            <img
              src={currentAsset?.url}
              alt={`${project.name} — ${assetIndex + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded"
            />
          )}

          {/* Asset navigation arrows */}
          {sortedAssets.length > 1 && (
            <>
              <button
                onClick={goPrevAsset}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border-custom text-text-primary hover:text-accent hover:border-accent transition-colors flex items-center justify-center bg-bg-primary/60"
                aria-label="Asset anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNextAsset}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border-custom text-text-primary hover:text-accent hover:border-accent transition-colors flex items-center justify-center bg-bg-primary/60"
                aria-label="Asset siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* Bottom bar: asset thumbnails + project nav */}
        <div className="flex-shrink-0 border-t border-border-custom px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Project prev/next */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={goPrevProject}
                className="w-8 h-8 rounded border border-border-custom text-text-secondary hover:text-accent hover:border-accent transition-colors flex items-center justify-center"
                aria-label="Proyecto anterior"
              >
                <ChevronUp size={14} />
              </button>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {projectIndex + 1} / {projects.length}
              </span>
              <button
                onClick={goNextProject}
                className="w-8 h-8 rounded border border-border-custom text-text-secondary hover:text-accent hover:border-accent transition-colors flex items-center justify-center"
                aria-label="Proyecto siguiente"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Asset thumbnails */}
            {sortedAssets.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto flex-1 justify-center">
                {sortedAssets.map((asset, idx) => (
                  <button
                    key={asset.id}
                    onClick={() => setAssetIndex(idx)}
                    className={`relative flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                      idx === assetIndex ? 'border-accent' : 'border-transparent hover:border-text-muted'
                    }`}
                  >
                    {asset.type === 'video' ? (
                      <>
                        <img src={project.image} alt="" className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film size={14} className="text-text-primary" />
                        </div>
                      </>
                    ) : (
                      <img src={asset.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Asset counter */}
            <div className="text-xs text-text-muted flex-shrink-0 whitespace-nowrap">
              {sortedAssets.length > 0 ? `${assetIndex + 1} / ${sortedAssets.length}` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
