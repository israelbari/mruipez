import { useMemo, useState, useCallback } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { trpc } from '@/providers/trpc';
import {
  FolderOpen, MessageSquare, Eye, Star, Users, Layers, Upload,
  Calendar, RotateCw, ArrowRight, Clock, FileText, Image,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import StatCard from '@/components/admin/StatCard';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function formatDateFull(): string {
  const now = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState(7);
  const [refreshing, setRefreshing] = useState(false);

  const { projects, isLoading: projectsLoading } = useProjects();
  const { data: messages, isLoading: messagesLoading } = trpc.contact.list.useQuery();
  const { data: sections } = trpc.section.list.useQuery();
  const { data: uploads } = trpc.upload.list.useQuery();
  const { data: clients } = trpc.auth.listClients.useQuery();

  const totalProjects = projects.length;
  const featuredProjects = projects.filter((p) => p.featured).length;
  const totalMessages = messages?.length ?? 0;
  const unreadMessages = messages?.filter((m) => !m.read).length ?? 0;
  const activeSections = sections?.filter((s) => s.isActive).length ?? 0;
  const pendingUploads = uploads?.filter((u) => u.status === 'pending').length ?? 0;
  const totalClients = clients?.length ?? 0;

  const isLoading = projectsLoading || messagesLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const chartData = useMemo(() => {
    const now = new Date();
    const data: { day: string; acciones: number }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      data.push({
        day: DAYS_ES[d.getDay()],
        acciones: Math.floor(Math.random() * 8) + 1,
      });
    }
    return data;
  }, [period]);

  const pageDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    sections?.forEach((s) => {
      const key = s.pageId === 1 ? 'Inicio' : `Página ${s.pageId}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: '#00B4D8' }));
  }, [sections]);

  const quickActions = [
    { icon: <FileText className="w-6 h-6 text-accent" />, label: 'Editar Páginas', to: '/admin/pages' },
    { icon: <Layers className="w-6 h-6 text-accent" />, label: 'Gestionar Secciones', to: '/admin/sections' },
    { icon: <Image className="w-6 h-6 text-accent" />, label: 'Ver Portfolio', to: '/admin/projects' },
    { icon: <Users className="w-6 h-6 text-accent" />, label: 'Ver Clientes', to: '/admin/clients' },
    { icon: <MessageSquare className="w-6 h-6 text-accent" />, label: 'Mensajes', to: '/admin/messages' },
    { icon: <Upload className="w-6 h-6 text-accent" />, label: 'Uploads', to: '/admin/uploads' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RotateCw className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Resumen general de MRUIPEZ</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[13px] text-text-secondary">
            <Calendar className="w-4 h-4" />
            {formatDateFull()}
          </span>
          <button
            onClick={handleRefresh}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-bg-secondary border border-border-custom text-text-secondary hover:text-text-primary hover:shadow-sm transition-all"
            title="Actualizar datos"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderOpen className="w-5 h-5" />}
          value={totalProjects}
          label="Portfolio Total"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-400"
          value={featuredProjects}
          label="Destacados"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
          value={totalClients}
          label="Clientes"
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          value={unreadMessages}
          label="Mensajes No Leídos"
          subtext={`${totalMessages} total`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Layers className="w-5 h-5" />}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
          value={activeSections}
          label="Secciones Activas"
        />
        <StatCard
          icon={<Upload className="w-5 h-5" />}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-400"
          value={pendingUploads}
          label="Uploads Pendientes"
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          iconBg="bg-pink-500/10"
          iconColor="text-pink-400"
          value={uploads?.filter((u) => u.isPublic).length ?? 0}
          label="Públicos"
        />
        <StatCard
          icon={<FolderOpen className="w-5 h-5" />}
          iconBg="bg-cyan-500/10"
          iconColor="text-cyan-400"
          value={projects.filter((p) => p.category === 'Commercial').length}
          label="Comerciales"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-bg-secondary border border-border-custom rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-base font-semibold text-text-primary">Actividad Reciente</h2>
            <div className="flex bg-bg-primary rounded-lg p-1 gap-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setPeriod(d)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    period === d
                      ? 'bg-accent text-bg-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {d} días
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`${value} acciones`, '']}
              />
              <Area type="monotone" dataKey="acciones" stroke="#00B4D8" strokeWidth={2} fill="url(#activityFill)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Content Distribution */}
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6 flex flex-col">
          <h2 className="text-base font-semibold text-text-primary mb-4">Distribución de Contenido</h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            {pageDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pageDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={600}
                    >
                      {pageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#00B4D8', '#10B981', '#8B5CF6', '#F59E0B'][index % 4]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {pageDistribution.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: ['#00B4D8', '#10B981', '#8B5CF6', '#F59E0B'][i % 4] }}
                      />
                      <span className="text-xs text-text-secondary">
                        {p.name} ({p.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Clock className="w-10 h-10 text-text-muted mb-2" />
                <p className="text-sm text-text-muted">Sin datos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-border-custom">
            <h2 className="text-base font-semibold text-text-primary">Portfolio Reciente</h2>
            <span className="text-sm text-text-muted">{totalProjects} en total</span>
          </div>
          <div className="divide-y divide-border-custom">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="px-6 py-4 flex items-center gap-4 hover:bg-bg-tertiary/30 transition-colors">
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

        {/* Quick Actions */}
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex flex-col items-center gap-2 bg-bg-primary border border-border-custom rounded-[10px] p-4 hover:bg-bg-tertiary hover:border-accent/50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-center"
              >
                {action.icon}
                <span className="text-xs font-medium text-text-secondary">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Clients */}
      {clients && clients.length > 0 && (
        <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border-custom">
            <h2 className="text-base font-semibold text-text-primary">Clientes Recientes</h2>
          </div>
          <div className="divide-y divide-border-custom">
            {clients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-bg-tertiary/30 transition-colors">
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold flex-shrink-0">
                  {client.name?.charAt(0) ?? client.email.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{client.name || client.email}</p>
                  <p className="text-xs text-text-muted">{client.assignedProjects?.length ?? 0} proyectos</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    client.isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {client.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
