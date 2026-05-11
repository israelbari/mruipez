import { useState, useEffect } from 'react';
import { trpc } from '@/providers/trpc';
import { Save, Image, Box, Film, Armchair, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type SectionKey = 'hero' | 'services' | 'process' | 'stats' | 'cta';

const sectionLabels: Record<SectionKey, string> = {
  hero: 'Hero',
  services: 'Servicios',
  process: 'Proceso',
  stats: 'Estadísticas',
  cta: 'CTA',
};

const inputClass = "w-full h-11 bg-bg-primary border border-border-custom rounded px-3 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
const textareaClass = "w-full bg-bg-primary border border-border-custom rounded px-3 py-2 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors min-h-[100px] resize-y";
const labelClass = "text-xs uppercase tracking-wider text-text-secondary block mb-2";

export default function AdminContent() {
  const utils = trpc.useUtils();
  const { data: allContent, isLoading } = trpc.content.getAll.useQuery();
  const updateMutation = trpc.content.update.useMutation({
    onSuccess: () => {
      utils.content.getAll.invalidate();
      toast.success('Contenido guardado correctamente');
    },
    onError: (err) => {
      toast.error('Error al guardar: ' + err.message);
    },
  });

  const [activeTab, setActiveTab] = useState<SectionKey>('hero');

  // Form states
  const [heroForm, setHeroForm] = useState({
    label: '', heading: '', subtext: '', ctaText: '', ctaLink: '', backgroundImage: ''
  });
  const [servicesForm, setServicesForm] = useState({
    sectionLabel: '', sectionTitle: '', items: [] as Array<{ title: string; description: string; icon: string }>
  });
  const [processForm, setProcessForm] = useState({
    sectionLabel: '', sectionTitle: '', steps: [] as Array<{ number: string; title: string; description: string }>
  });
  const [statsForm, setStatsForm] = useState({
    items: [] as Array<{ value: number; suffix: string; label: string }>
  });
  const [ctaForm, setCtaForm] = useState({
    heading: '', subtext: '', ctaText: '', ctaLink: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  // Load data when allContent changes
  useEffect(() => {
    if (!allContent) return;
    allContent.forEach((c) => {
      const data = c.data as Record<string, unknown>;
      switch (c.section) {
        case 'hero':
          setHeroForm(data as typeof heroForm);
          break;
        case 'services':
          setServicesForm(data as typeof servicesForm);
          break;
        case 'process':
          setProcessForm(data as typeof processForm);
          break;
        case 'stats':
          setStatsForm(data as typeof statsForm);
          break;
        case 'cta':
          setCtaForm(data as typeof ctaForm);
          break;
      }
    });
  }, [allContent]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadingImage(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHeroForm(prev => ({ ...prev, backgroundImage: data.url }));
          toast.success('Imagen subida correctamente');
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setHeroForm(prev => ({ ...prev, backgroundImage: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroForm(prev => ({ ...prev, backgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = () => {
    let data: Record<string, unknown> = {};
    switch (activeTab) {
      case 'hero': data = heroForm; break;
      case 'services': data = servicesForm; break;
      case 'process': data = processForm; break;
      case 'stats': data = statsForm; break;
      case 'cta': data = ctaForm; break;
    }
    updateMutation.mutate({ section: activeTab, data });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-text-primary text-3xl">Contenido del sitio</h1>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-bg-primary text-sm font-medium rounded hover:bg-accent transition-colors disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar cambios
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border-custom">
        {(Object.keys(sectionLabels) as SectionKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {sectionLabels[key]}
          </button>
        ))}
      </div>

      {/* Hero Form */}
      {activeTab === 'hero' && (
        <div className="bg-bg-secondary border border-border-custom rounded-lg p-6 space-y-5 max-w-2xl">
          <div>
            <label className={labelClass}>Etiqueta superior</label>
            <input className={inputClass} value={heroForm.label} onChange={e => setHeroForm(p => ({ ...p, label: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Título principal</label>
            <input className={inputClass} value={heroForm.heading} onChange={e => setHeroForm(p => ({ ...p, heading: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Subtítulo</label>
            <textarea className={textareaClass} value={heroForm.subtext} onChange={e => setHeroForm(p => ({ ...p, subtext: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Texto del botón</label>
              <input className={inputClass} value={heroForm.ctaText} onChange={e => setHeroForm(p => ({ ...p, ctaText: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Enlace del botón</label>
              <input className={inputClass} value={heroForm.ctaLink} onChange={e => setHeroForm(p => ({ ...p, ctaLink: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Imagen de fondo</label>
            <div className="flex gap-3 items-start">
              {heroForm.backgroundImage && (
                <img src={heroForm.backgroundImage} alt="" className="w-32 h-20 object-cover rounded border border-border-custom" />
              )}
              <div className="flex-1">
                <input className={inputClass + ' mb-2'} value={heroForm.backgroundImage} onChange={e => setHeroForm(p => ({ ...p, backgroundImage: e.target.value }))} placeholder="URL de imagen" />
                <label className="flex items-center gap-2 px-4 py-2 border border-border-custom rounded cursor-pointer hover:border-accent transition-colors text-sm text-text-secondary w-fit">
                  <Image size={16} />
                  {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Form */}
      {activeTab === 'services' && (
        <div className="bg-bg-secondary border border-border-custom rounded-lg p-6 space-y-5 max-w-2xl">
          <div>
            <label className={labelClass}>Etiqueta de sección</label>
            <input className={inputClass} value={servicesForm.sectionLabel} onChange={e => setServicesForm(p => ({ ...p, sectionLabel: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Título de sección</label>
            <input className={inputClass} value={servicesForm.sectionTitle} onChange={e => setServicesForm(p => ({ ...p, sectionTitle: e.target.value }))} />
          </div>
          <div className="space-y-4">
            <label className={labelClass}>Servicios</label>
            {servicesForm.items.map((item, idx) => (
              <div key={idx} className="border border-border-custom rounded p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  {item.icon === 'Box' && <Box size={16} className="text-accent" />}
                  {item.icon === 'Film' && <Film size={16} className="text-accent" />}
                  {item.icon === 'Armchair' && <Armchair size={16} className="text-accent" />}
                  <span className="text-sm text-text-muted">Servicio {idx + 1}</span>
                </div>
                <input className={inputClass} placeholder="Título" value={item.title} onChange={e => {
                  const items = [...servicesForm.items];
                  items[idx].title = e.target.value;
                  setServicesForm(p => ({ ...p, items }));
                }} />
                <textarea className={textareaClass} placeholder="Descripción" value={item.description} onChange={e => {
                  const items = [...servicesForm.items];
                  items[idx].description = e.target.value;
                  setServicesForm(p => ({ ...p, items }));
                }} />
                <select className={inputClass} value={item.icon} onChange={e => {
                  const items = [...servicesForm.items];
                  items[idx].icon = e.target.value;
                  setServicesForm(p => ({ ...p, items }));
                }}>
                  <option value="Box">Box (3D)</option>
                  <option value="Film">Film (Video)</option>
                  <option value="Armchair">Armchair (Staging)</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Form */}
      {activeTab === 'process' && (
        <div className="bg-bg-secondary border border-border-custom rounded-lg p-6 space-y-5 max-w-2xl">
          <div>
            <label className={labelClass}>Etiqueta de sección</label>
            <input className={inputClass} value={processForm.sectionLabel} onChange={e => setProcessForm(p => ({ ...p, sectionLabel: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Título de sección</label>
            <input className={inputClass} value={processForm.sectionTitle} onChange={e => setProcessForm(p => ({ ...p, sectionTitle: e.target.value }))} />
          </div>
          <div className="space-y-4">
            <label className={labelClass}>Pasos del proceso</label>
            {processForm.steps.map((step, idx) => (
              <div key={idx} className="border border-border-custom rounded p-4 space-y-3">
                <span className="text-sm text-text-muted">Paso {idx + 1}</span>
                <input className={inputClass} placeholder="Número (ej: 01)" value={step.number} onChange={e => {
                  const steps = [...processForm.steps];
                  steps[idx].number = e.target.value;
                  setProcessForm(p => ({ ...p, steps }));
                }} />
                <input className={inputClass} placeholder="Título" value={step.title} onChange={e => {
                  const steps = [...processForm.steps];
                  steps[idx].title = e.target.value;
                  setProcessForm(p => ({ ...p, steps }));
                }} />
                <textarea className={textareaClass} placeholder="Descripción" value={step.description} onChange={e => {
                  const steps = [...processForm.steps];
                  steps[idx].description = e.target.value;
                  setProcessForm(p => ({ ...p, steps }));
                }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Form */}
      {activeTab === 'stats' && (
        <div className="bg-bg-secondary border border-border-custom rounded-lg p-6 space-y-5 max-w-2xl">
          <div className="space-y-4">
            <label className={labelClass}>Estadísticas</label>
            {statsForm.items.map((item, idx) => (
              <div key={idx} className="border border-border-custom rounded p-4 space-y-3">
                <span className="text-sm text-text-muted">Estadística {idx + 1}</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Valor</label>
                    <input type="number" className={inputClass} value={item.value} onChange={e => {
                      const items = [...statsForm.items];
                      items[idx].value = Number(e.target.value);
                      setStatsForm(p => ({ ...p, items }));
                    }} />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Sufijo</label>
                    <input className={inputClass} value={item.suffix} onChange={e => {
                      const items = [...statsForm.items];
                      items[idx].suffix = e.target.value;
                      setStatsForm(p => ({ ...p, items }));
                    }} />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Etiqueta</label>
                    <input className={inputClass} value={item.label} onChange={e => {
                      const items = [...statsForm.items];
                      items[idx].label = e.target.value;
                      setStatsForm(p => ({ ...p, items }));
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Form */}
      {activeTab === 'cta' && (
        <div className="bg-bg-secondary border border-border-custom rounded-lg p-6 space-y-5 max-w-2xl">
          <div>
            <label className={labelClass}>Título</label>
            <input className={inputClass} value={ctaForm.heading} onChange={e => setCtaForm(p => ({ ...p, heading: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Subtítulo</label>
            <textarea className={textareaClass} value={ctaForm.subtext} onChange={e => setCtaForm(p => ({ ...p, subtext: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Texto del botón</label>
              <input className={inputClass} value={ctaForm.ctaText} onChange={e => setCtaForm(p => ({ ...p, ctaText: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Enlace del botón</label>
              <input className={inputClass} value={ctaForm.ctaLink} onChange={e => setCtaForm(p => ({ ...p, ctaLink: e.target.value }))} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
