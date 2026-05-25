interface ProjectAsset {
  id: number;
  projectId?: number;
  url: string;
  type: 'image' | 'video';
  order: number;
}

interface ProjectItem {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  video?: string | null;
  assets: ProjectAsset[];
}

interface ProjectCardProps {
  project: ProjectItem;
  onClick?: () => void;
  className?: string;
}

export default function ProjectCard({ project, onClick, className = '' }: ProjectCardProps) {
  return (
    <div
      className={`group relative overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      <img
        src={project.image}
        alt={project.name}
        loading="lazy"
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <h3 className="font-sans font-medium text-text-primary" style={{ fontSize: '1rem' }}>{project.name}</h3>
        <p className="font-sans uppercase text-text-secondary mt-1" style={{ fontSize: '0.6875rem', letterSpacing: '0.06em' }}>{project.category} / {project.subcategory}</p>
      </div>
    </div>
  );
}
