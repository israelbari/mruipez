import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
interface ProjectItem {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  video?: string | null;
}

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIndex: number;
  onNavigate: (index: number) => void;
  projects: ProjectItem[];
}

export default function LightboxModal({ isOpen, onClose, currentIndex, onNavigate, projects }: LightboxModalProps) {
  const project = projects[currentIndex];

  const goNext = useCallback(() => {
    onNavigate((currentIndex + 1) % projects.length);
  }, [currentIndex, onNavigate, projects.length]);

  const goPrev = useCallback(() => {
    onNavigate((currentIndex - 1 + projects.length) % projects.length);
  }, [currentIndex, onNavigate, projects.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goNext, goPrev]);

  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(18, 18, 18, 0.95)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute top-6 right-6 text-text-secondary hover:text-text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded p-1 z-10"
        onClick={onClose}
        aria-label="Cerrar galería"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      <button
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-border-custom text-text-primary hover:text-accent hover:border-accent transition-colors duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent z-10"
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        aria-label="Proyecto anterior"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      <button
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-border-custom text-text-primary hover:text-accent hover:border-accent transition-colors duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent z-10"
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        aria-label="Proyecto siguiente"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>

      <div className="flex flex-col items-center max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        {/* Show video player if project has video */}
        {project.video ? (
          <div className="w-full max-w-4xl">
            <VideoPlayer
              src={project.video}
              poster={project.image}
              className="w-full aspect-video"
            />
          </div>
        ) : (
          <img src={project.image} alt={project.name} className="max-w-full max-h-[70vh] object-contain rounded" />
        )}
        <div className="text-center mt-6">
          <div className="flex items-center gap-2 justify-center">
            <h3 className="font-sans font-medium text-text-primary" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
              {project.name}
            </h3>
            {project.video && <Film size={16} className="text-accent" />}
          </div>
          <p className="font-sans uppercase text-text-secondary mt-1" style={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
            {project.category} / {project.subcategory}
          </p>
        </div>
      </div>
    </div>
  );
}
