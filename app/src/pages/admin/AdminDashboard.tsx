import { useLocalProjects, useLocalMessages } from '@/hooks/useLocalProjects';
import { FolderOpen, MessageSquare, Eye, Star } from 'lucide-react';

export default function AdminDashboard() {
  const { projects } = useLocalProjects();
  const { messages } = useLocalMessages();

  const totalProjects = projects.length;
  const featuredProjects = projects.filter(p => p.featured).length;
  const totalMessages = messages.length;
  const unreadMessages = messages.filter(m => !m.read).length;

  const stats = [
    { label: 'Total Proyectos', value: totalProjects, icon: FolderOpen, color: 'text-accent' },
    { label: 'Proyectos Destacados', value: featuredProjects, icon: Star, color: 'text-text-primary' },
    { label: 'Total Mensajes', value: totalMessages, icon: MessageSquare, color: 'text-text-secondary' },
    { label: 'Mensajes No Leídos', value: unreadMessages, icon: Eye, color: 'text-accent' },
  ];

  return (
    <div>
      <h1 className="font-display text-text-primary text-3xl mb-8">Panel</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-bg-secondary border border-border-custom rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon size={20} className={stat.color} />
                <span className="font-display text-2xl text-text-primary">{stat.value}</span>
              </div>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
          <h2 className="font-medium text-text-primary">Proyectos Recientes</h2>
          <span className="text-sm text-text-muted">{totalProjects} en total</span>
        </div>
        <div className="divide-y divide-border-custom">
          {projects.slice(0, 5).map((project) => (
            <div key={project.id} className="px-6 py-4 flex items-center gap-4">
              <img src={project.image} alt="" className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <div className="text-sm text-text-primary font-medium">{project.name}</div>
                <div className="text-xs text-text-muted">{project.category} / {project.subcategory}</div>
              </div>
              {project.video && (
                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Vídeo</span>
              )}
              {project.featured && (
                <span className="text-xs bg-text-primary/10 text-text-primary px-2 py-1 rounded">Destacado</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
