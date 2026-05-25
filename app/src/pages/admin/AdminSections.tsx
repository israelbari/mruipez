import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Image, Film,
  ArrowLeft, Save, X, Loader2, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import SectionRenderer from '@/components/sections/SectionRenderer';

const sectionTypes = [
  { value: 'hero', label: 'Hero Principal', icon: Image },
  { value: 'services', label: 'Servicios', icon: Image },
  { value: 'process', label: 'Proceso', icon: Image },
  { value: 'stats', label: 'Estadísticas', icon: Image },
  { value: 'cta', label: 'CTA', icon: Image },
  { value: 'gallery', label: 'Galería', icon: Image },
  { value: 'video_showcase', label: 'Video Showcase', icon: Film },
  { value: 'fullscreen_slider', label: 'Slider Fullscreen', icon: Image },
];

const animationOptions = ['fade-up', 'fade-in', 'reveal', 'zoom', 'none'];
const transitionOptions = ['smooth', 'instant', 'crossfade'];
const bgTypeOptions = ['video', 'image', 'gradient', 'solid'];

export default function AdminSections() {
  const utils = trpc.useUtils();
  const { data: pages } = trpc.page.list.useQuery();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);

  const { data: sections, isLoading } = trpc.section.list.useQuery(
    selectedPageId ? { pageId: selectedPageId } : undefined
  );

  const createMutation = trpc.section.create.useMutation({
    onSuccess: () => {
      utils.section.list.invalidate();
      toast.success('Sección creada');
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.section.update.useMutation({
    onSuccess: () => {
      utils.section.list.invalidate();
      toast.success('Sección actualizada');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.section.delete.useMutation({
    onSuccess: () => {
      utils.section.list.invalidate();
      toast.success('Sección eliminada');
    },
    onError: (err) => toast.error(err.message),
  });

  const reorderMutation = trpc.section.reorder.useMutation({
    onSuccess: () => utils.section.list.invalidate(),
  });

  const addMediaMutation = trpc.section.addMedia.useMutation({
    onSuccess: () => {
      utils.section.list.invalidate();
      toast.success('Media añadida');
    },
  });

  const removeMediaMutation = trpc.section.removeMedia.useMutation({
    onSuccess: () => {
      utils.section.list.invalidate();
      toast.success('Media eliminada');
    },
  });

  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('list');
  const [editingSection, setEditingSection] = useState<NonNullable<typeof sections>[number] | null>(null);
  const [previewSection, setPreviewSection] = useState<NonNullable<typeof sections>[number] | null>(null);
  const [visualMode, setVisualMode] = useState<boolean>(true);
  const [visualData, setVisualData] = useState<any>({});
  const [visualSettings, setVisualSettings] = useState<any>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [form, setForm] = useState({
    type: 'hero' as string,
    title: '',
    subtitle: '',
    data: '{}' as string,
    settings: '{}' as string,
    order: 0,
    isActive: true,
  });
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const initializeDefaultVisualData = (type: string) => {
    switch (type) {
      case 'hero':
        return { label: '', heading: '', subtext: '', ctaText: '', ctaLink: '', backgroundImage: '' };
      case 'services':
        return { sectionLabel: '', sectionTitle: '', items: [] };
      case 'process':
        return { sectionLabel: '', sectionTitle: '', steps: [] };
      case 'stats':
        return { items: [] };
      case 'cta':
        return { heading: '', subtext: '', ctaText: '', ctaLink: '' };
      case 'gallery':
        return { sectionLabel: '', sectionTitle: '', layout: 'grid' };
      case 'video_showcase':
        return { sectionLabel: '', sectionTitle: '', description: '' };
      case 'fullscreen_slider':
        return { sectionLabel: '', sectionTitle: '' };
      default:
        return {};
    }
  };

  const initializeDefaultVisualSettings = (type: string) => {
    switch (type) {
      case 'hero':
        return { backgroundType: 'video', overlayOpacity: 0.4, autoplay: true, loop: true, muted: true };
      case 'video_showcase':
        return { autoplay: true, loop: true, muted: true, aspectRatio: '16:9' };
      case 'fullscreen_slider':
        return { autoplay: true, interval: 5000, transition: 'smooth' };
      default:
        return {};
    }
  };

  const resetForm = () => {
    setForm({ type: 'hero', title: '', subtitle: '', data: '{}', settings: '{}', order: 0, isActive: true });
    setVisualData(initializeDefaultVisualData('hero'));
    setVisualSettings(initializeDefaultVisualSettings('hero'));
    setMediaUrl('');
  };

  const openCreate = () => {
    if (!selectedPageId) { toast.error('Selecciona una página primero'); return; }
    resetForm();
    setVisualMode(true);
    setMode('create');
    setEditingSection(null);
  };

  const openEdit = (section: NonNullable<typeof sections>[number]) => {
    setEditingSection(section);
    setForm({
      type: section.type,
      title: section.title ?? '',
      subtitle: section.subtitle ?? '',
      data: JSON.stringify(section.data ?? {}, null, 2),
      settings: JSON.stringify(section.settings ?? {}, null, 2),
      order: section.order,
      isActive: section.isActive,
    });
    setVisualData(section.data ?? {});
    setVisualSettings(section.settings ?? {});
    setVisualMode(true);
    setMode('edit');
  };

  const handleSave = () => {
    try {
      let dataObj = {};
      let settingsObj = {};

      if (visualMode) {
        dataObj = visualData;
        settingsObj = visualSettings;
      } else {
        dataObj = JSON.parse(form.data);
        settingsObj = JSON.parse(form.settings);
      }

      const payload = {
        type: form.type as any,
        title: form.title || undefined,
        subtitle: form.subtitle || undefined,
        data: dataObj,
        settings: settingsObj,
        order: form.order,
        isActive: form.isActive,
      };

      if (mode === 'edit' && editingSection) {
        updateMutation.mutate({ id: editingSection.id, ...payload });
      } else if (mode === 'create' && selectedPageId) {
        createMutation.mutate({ pageId: selectedPageId, ...payload });
      }
      setMode('list');
    } catch {
      toast.error('JSON inválido en data o settings');
    }
  };

  const handleVisualImageUpload = async (file: File, fieldName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadingImage(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const resData = await res.json();
        if (resData.success) {
          setVisualData((prev: any) => ({ ...prev, [fieldName]: resData.url }));
          toast.success('Imagen subida correctamente');
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVisualData((prev: any) => ({ ...prev, [fieldName]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVisualData((prev: any) => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar esta sección?')) deleteMutation.mutate({ id });
  };

  const moveOrder = (section: NonNullable<typeof sections>[number], direction: number) => {
    const currentSections = (sections ?? []).filter((s) => s.pageId === section.pageId).sort((a, b) => a.order - b.order);
    const idx = currentSections.findIndex((s) => s.id === section.id);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= currentSections.length) return;

    const reordered = currentSections.map((s, i) => ({
      id: s.id,
      order: i === idx ? currentSections[newIdx].order : i === newIdx ? currentSections[idx].order : s.order,
    }));
    reorderMutation.mutate(reordered);
  };

  const handleAddMedia = () => {
    if (!mediaUrl.trim() || !editingSection) return;
    addMediaMutation.mutate({ sectionId: editingSection.id, url: mediaUrl, type: mediaType });
    setMediaUrl('');
  };

  const handleRemoveMedia = (id: number) => {
    removeMediaMutation.mutate({ id });
  };

  const inputClass = "w-full h-11 bg-bg-primary border border-border-custom rounded px-3 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors font-mono text-xs";
  const inputClassNormal = "w-full h-11 bg-bg-primary border border-border-custom rounded px-3 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
  const textareaClass = "w-full bg-bg-primary border border-border-custom rounded px-3 py-2 text-text-primary text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors min-h-[100px] resize-y";
  const labelClass = "text-xs uppercase tracking-wider text-text-secondary block mb-2";

  if (mode === 'edit' || mode === 'create') {
    const renderVisualForm = () => {
      switch (form.type) {
        case 'hero':
          return (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Etiqueta superior</label>
                <input
                  className={inputClassNormal}
                  value={visualData.label || ''}
                  onChange={(e) => setVisualData({ ...visualData, label: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Título principal</label>
                <input
                  className={inputClassNormal}
                  value={visualData.heading || ''}
                  onChange={(e) => setVisualData({ ...visualData, heading: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Subtítulo</label>
                <textarea
                  className={textareaClass}
                  value={visualData.subtext || ''}
                  onChange={(e) => setVisualData({ ...visualData, subtext: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Texto del botón</label>
                  <input
                    className={inputClassNormal}
                    value={visualData.ctaText || ''}
                    onChange={(e) => setVisualData({ ...visualData, ctaText: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Enlace del botón</label>
                  <input
                    className={inputClassNormal}
                    value={visualData.ctaLink || ''}
                    onChange={(e) => setVisualData({ ...visualData, ctaLink: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Imagen o Video de fondo</label>
                <div className="flex gap-3 items-start">
                  {visualData.backgroundImage && (
                    <div className="w-32 h-20 bg-bg-tertiary rounded border border-border-custom overflow-hidden">
                      {visualData.backgroundImage.endsWith('.mp4') || visualData.backgroundImage.endsWith('.webm') ? (
                        <div className="w-full h-full flex items-center justify-center text-accent">
                          <Film size={24} />
                        </div>
                      ) : (
                        <img src={visualData.backgroundImage} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      className={inputClassNormal + ' mb-2'}
                      value={visualData.backgroundImage || ''}
                      onChange={(e) => setVisualData({ ...visualData, backgroundImage: e.target.value })}
                      placeholder="URL de imagen o video"
                    />
                    <label className="flex items-center gap-2 px-4 py-2 border border-border-custom rounded cursor-pointer hover:border-accent transition-colors text-sm text-text-secondary w-fit bg-bg-primary">
                      <Image size={16} />
                      {uploadingImage ? 'Subiendo...' : 'Subir archivo'}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleVisualImageUpload(e.target.files[0], 'backgroundImage')}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="border-t border-border-custom pt-4 space-y-4">
                <h3 className="text-sm font-medium text-text-primary">Ajustes del Hero</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tipo de fondo</label>
                    <select
                      className={inputClassNormal}
                      value={visualSettings.backgroundType || 'video'}
                      onChange={(e) => setVisualSettings({ ...visualSettings, backgroundType: e.target.value })}
                    >
                      <option value="video">Video</option>
                      <option value="image">Imagen</option>
                      <option value="gradient">Gradiente</option>
                      <option value="solid">Sólido</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Opacidad del overlay ({visualSettings.overlayOpacity ?? 0.4})</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      className="w-full accent-accent h-11"
                      value={visualSettings.overlayOpacity ?? 0.4}
                      onChange={(e) => setVisualSettings({ ...visualSettings, overlayOpacity: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualSettings.autoplay ?? true}
                      onChange={(e) => setVisualSettings({ ...visualSettings, autoplay: e.target.checked })}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm text-text-primary">Autoplay</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualSettings.loop ?? true}
                      onChange={(e) => setVisualSettings({ ...visualSettings, loop: e.target.checked })}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm text-text-primary">Bucle (Loop)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualSettings.muted ?? true}
                      onChange={(e) => setVisualSettings({ ...visualSettings, muted: e.target.checked })}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm text-text-primary">Silenciado</span>
                  </label>
                </div>
              </div>
            </div>
          );
        case 'services':
          return (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Etiqueta de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionLabel || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionLabel: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Título de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionTitle || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionTitle: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border-custom pb-2">
                  <label className={labelClass + " m-0"}>Lista de Servicios</label>
                  <Button
                    type="button"
                    onClick={() => {
                      const currentItems = visualData.items ?? [];
                      setVisualData({
                        ...visualData,
                        items: [...currentItems, { title: '', description: '', icon: 'Box' }]
                      });
                    }}
                    className="bg-accent text-white hover:bg-accent/90 h-8 text-xs px-3"
                  >
                    + Añadir Servicio
                  </Button>
                </div>
                {(visualData.items ?? []).map((item: any, idx: number) => (
                  <div key={idx} className="border border-border-custom rounded p-4 space-y-3 bg-bg-primary/40 relative group">
                    <button
                      type="button"
                      onClick={() => {
                        const items = (visualData.items ?? []).filter((_: any, i: number) => i !== idx);
                        setVisualData({ ...visualData, items });
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded flex items-center justify-center transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <span className="text-xs text-accent font-medium uppercase tracking-wider block">Servicio {idx + 1}</span>
                    <div>
                      <label className="text-xs text-text-secondary block mb-1">Título del servicio</label>
                      <input
                        className={inputClassNormal}
                        placeholder="Título"
                        value={item.title || ''}
                        onChange={(e) => {
                          const items = [...(visualData.items ?? [])];
                          items[idx] = { ...items[idx], title: e.target.value };
                          setVisualData({ ...visualData, items });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary block mb-1">Descripción</label>
                      <textarea
                        className={textareaClass}
                        placeholder="Descripción"
                        value={item.description || ''}
                        onChange={(e) => {
                          const items = [...(visualData.items ?? [])];
                          items[idx] = { ...items[idx], description: e.target.value };
                          setVisualData({ ...visualData, items });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary block mb-1">Icono</label>
                      <select
                        className={inputClassNormal}
                        value={item.icon || 'Box'}
                        onChange={(e) => {
                          const items = [...(visualData.items ?? [])];
                          items[idx] = { ...items[idx], icon: e.target.value };
                          setVisualData({ ...visualData, items });
                        }}
                      >
                        <option value="Box">Caja (Box/3D)</option>
                        <option value="Film">Película (Film/Video)</option>
                        <option value="Armchair">Sillón (Armchair/Staging)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'process':
          return (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Etiqueta de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionLabel || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionLabel: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Título de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionTitle || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionTitle: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border-custom pb-2">
                  <label className={labelClass + " m-0"}>Lista de Pasos</label>
                  <Button
                    type="button"
                    onClick={() => {
                      const currentSteps = visualData.steps ?? [];
                      const nextNum = String(currentSteps.length + 1).padStart(2, '0');
                      setVisualData({
                        ...visualData,
                        steps: [...currentSteps, { number: nextNum, title: '', description: '' }]
                      });
                    }}
                    className="bg-accent text-white hover:bg-accent/90 h-8 text-xs px-3"
                  >
                    + Añadir Paso
                  </Button>
                </div>
                {(visualData.steps ?? []).map((step: any, idx: number) => (
                  <div key={idx} className="border border-border-custom rounded p-4 space-y-3 bg-bg-primary/40 relative group">
                    <button
                      type="button"
                      onClick={() => {
                        const steps = (visualData.steps ?? []).filter((_: any, i: number) => i !== idx);
                        setVisualData({ ...visualData, steps });
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded flex items-center justify-center transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <span className="text-xs text-accent font-medium uppercase tracking-wider block">Paso {idx + 1}</span>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <label className="text-xs text-text-secondary block mb-1">Número</label>
                        <input
                          className={inputClassNormal}
                          placeholder="01"
                          value={step.number || ''}
                          onChange={(e) => {
                            const steps = [...(visualData.steps ?? [])];
                            steps[idx] = { ...steps[idx], number: e.target.value };
                            setVisualData({ ...visualData, steps });
                          }}
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-text-secondary block mb-1">Título del paso</label>
                        <input
                          className={inputClassNormal}
                          placeholder="Título"
                          value={step.title || ''}
                          onChange={(e) => {
                            const steps = [...(visualData.steps ?? [])];
                            steps[idx] = { ...steps[idx], title: e.target.value };
                            setVisualData({ ...visualData, steps });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary block mb-1">Descripción</label>
                      <textarea
                        className={textareaClass}
                        placeholder="Descripción"
                        value={step.description || ''}
                        onChange={(e) => {
                          const steps = [...(visualData.steps ?? [])];
                          steps[idx] = { ...steps[idx], description: e.target.value };
                          setVisualData({ ...visualData, steps });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'stats':
          return (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border-custom pb-2">
                  <label className={labelClass + " m-0"}>Lista de Estadísticas</label>
                  <Button
                    type="button"
                    onClick={() => {
                      const currentItems = visualData.items ?? [];
                      setVisualData({
                        ...visualData,
                        items: [...currentItems, { value: 0, suffix: '', label: '' }]
                      });
                    }}
                    className="bg-accent text-white hover:bg-accent/90 h-8 text-xs px-3"
                  >
                    + Añadir Estadística
                  </Button>
                </div>
                {(visualData.items ?? []).map((item: any, idx: number) => (
                  <div key={idx} className="border border-border-custom rounded p-4 space-y-3 bg-bg-primary/40 relative group">
                    <button
                      type="button"
                      onClick={() => {
                        const items = (visualData.items ?? []).filter((_: any, i: number) => i !== idx);
                        setVisualData({ ...visualData, items });
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded flex items-center justify-center transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <span className="text-xs text-accent font-medium uppercase tracking-wider block">Estadística {idx + 1}</span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-text-secondary block mb-1">Valor numérico</label>
                        <input
                          type="number"
                          className={inputClassNormal}
                          value={item.value ?? 0}
                          onChange={(e) => {
                            const items = [...(visualData.items ?? [])];
                            items[idx] = { ...items[idx], value: Number(e.target.value) };
                            setVisualData({ ...visualData, items });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary block mb-1">Sufijo (ej: % o +)</label>
                        <input
                          className={inputClassNormal}
                          value={item.suffix || ''}
                          onChange={(e) => {
                            const items = [...(visualData.items ?? [])];
                            items[idx] = { ...items[idx], suffix: e.target.value };
                            setVisualData({ ...visualData, items });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary block mb-1">Etiqueta</label>
                        <input
                          className={inputClassNormal}
                          value={item.label || ''}
                          onChange={(e) => {
                            const items = [...(visualData.items ?? [])];
                            items[idx] = { ...items[idx], label: e.target.value };
                            setVisualData({ ...visualData, items });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'cta':
          return (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Título principal</label>
                <input
                  className={inputClassNormal}
                  value={visualData.heading || ''}
                  onChange={(e) => setVisualData({ ...visualData, heading: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Subtítulo</label>
                <textarea
                  className={textareaClass}
                  value={visualData.subtext || ''}
                  onChange={(e) => setVisualData({ ...visualData, subtext: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Texto del botón</label>
                  <input
                    className={inputClassNormal}
                    value={visualData.ctaText || ''}
                    onChange={(e) => setVisualData({ ...visualData, ctaText: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Enlace del botón</label>
                  <input
                    className={inputClassNormal}
                    value={visualData.ctaLink || ''}
                    onChange={(e) => setVisualData({ ...visualData, ctaLink: e.target.value })}
                  />
                </div>
              </div>
            </div>
          );
        case 'gallery':
          return (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Etiqueta de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionLabel || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionLabel: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Título de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionTitle || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionTitle: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Diseño (Layout)</label>
                <select
                  className={inputClassNormal}
                  value={visualData.layout || 'grid'}
                  onChange={(e) => setVisualData({ ...visualData, layout: e.target.value })}
                >
                  <option value="grid">Cuadrícula (Grid)</option>
                  <option value="masonry">Asimétrico (Masonry)</option>
                </select>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Nota: Para gestionar las imágenes de esta galería, utiliza la sección "Media de la sección" en la parte inferior del formulario.
              </p>
            </div>
          );
        case 'video_showcase':
          return (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Etiqueta de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionLabel || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionLabel: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Título de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionTitle || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionTitle: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea
                  className={textareaClass}
                  value={visualData.description || ''}
                  onChange={(e) => setVisualData({ ...visualData, description: e.target.value })}
                />
              </div>
              <div className="border-t border-border-custom pt-4 space-y-4">
                <h3 className="text-sm font-medium text-text-primary">Ajustes de Video</h3>
                <div>
                  <label className={labelClass}>Relación de aspecto</label>
                  <select
                    className={inputClassNormal}
                    value={visualSettings.aspectRatio || '16:9'}
                    onChange={(e) => setVisualSettings({ ...visualSettings, aspectRatio: e.target.value })}
                  >
                    <option value="16:9">Horizontal (16:9)</option>
                    <option value="21:9">Ultra-ancho (21:9)</option>
                  </select>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualSettings.autoplay ?? true}
                      onChange={(e) => setVisualSettings({ ...visualSettings, autoplay: e.target.checked })}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm text-text-primary">Autoplay</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualSettings.loop ?? true}
                      onChange={(e) => setVisualSettings({ ...visualSettings, loop: e.target.checked })}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm text-text-primary">Bucle (Loop)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualSettings.muted ?? true}
                      onChange={(e) => setVisualSettings({ ...visualSettings, muted: e.target.checked })}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm text-text-primary">Silenciado</span>
                  </label>
                </div>
                <p className="text-xs text-text-muted">
                  Nota: Asegúrate de subir o enlazar el video correspondiente en la sección de "Media de la sección" abajo.
                </p>
              </div>
            </div>
          );
        case 'fullscreen_slider':
          return (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Etiqueta de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionLabel || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionLabel: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Título de la sección</label>
                <input
                  className={inputClassNormal}
                  value={visualData.sectionTitle || ''}
                  onChange={(e) => setVisualData({ ...visualData, sectionTitle: e.target.value })}
                />
              </div>
              <div className="border-t border-border-custom pt-4 space-y-4">
                <h3 className="text-sm font-medium text-text-primary">Ajustes del Slider</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Intervalo de cambio (ms)</label>
                    <input
                      type="number"
                      className={inputClassNormal}
                      value={visualSettings.interval ?? 5000}
                      onChange={(e) => setVisualSettings({ ...visualSettings, interval: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Transición</label>
                    <select
                      className={inputClassNormal}
                      value={visualSettings.transition || 'smooth'}
                      onChange={(e) => setVisualSettings({ ...visualSettings, transition: e.target.value })}
                    >
                      <option value="smooth">Suave (Smooth)</option>
                      <option value="instant">Instantáneo</option>
                      <option value="crossfade">Desvanecimiento (Crossfade)</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visualSettings.autoplay ?? true}
                    onChange={(e) => setVisualSettings({ ...visualSettings, autoplay: e.target.checked })}
                    className="w-4 h-4 accent-accent"
                  />
                  <span className="text-sm text-text-primary">Autoplay</span>
                </label>
                <p className="text-xs text-text-muted">
                  Nota: Gestiona los elementos visuales de este Slider utilizando "Media de la sección" en la parte inferior.
                </p>
              </div>
            </div>
          );
        default:
          return <p className="text-text-secondary text-sm">Formulario no disponible para este tipo.</p>;
      }
    };

    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setMode('list')} className="text-text-secondary hover:text-text-primary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-display text-text-primary text-3xl">
              {mode === 'edit' ? 'Editar Sección' : 'Nueva Sección'}
            </h1>
          </div>
          <div className="flex gap-2">
            {editingSection && (
              <button
                onClick={() => setPreviewSection(editingSection)}
                className="flex items-center gap-2 px-4 py-2.5 border border-border-custom text-text-secondary text-sm rounded hover:border-text-secondary transition-colors"
              >
                <Eye size={16} /> Preview
              </button>
            )}
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-bg-primary text-sm font-medium rounded hover:bg-accent transition-colors">
              <Save size={16} /> Guardar
            </button>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-custom rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border-custom pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Modo de edición</span>
            </div>
            <div className="flex bg-bg-primary rounded p-0.5 border border-border-custom">
              <button
                type="button"
                onClick={() => setVisualMode(true)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${visualMode ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Visual (Sin Código)
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(p => ({
                    ...p,
                    data: JSON.stringify(visualData, null, 2),
                    settings: JSON.stringify(visualSettings, null, 2)
                  }));
                  setVisualMode(false);
                }}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${!visualMode ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Avanzado (JSON)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo</label>
              <select
                className={inputClassNormal}
                value={form.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setForm({ ...form, type: newType });
                  setVisualData(initializeDefaultVisualData(newType));
                  setVisualSettings(initializeDefaultVisualSettings(newType));
                }}
              >
                {sectionTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Orden</label>
              <input type="number" className={inputClassNormal} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Título</label>
            <input className={inputClassNormal} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label className={labelClass}>Subtítulo</label>
            <input className={inputClassNormal} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>

          {visualMode ? (
            <div className="border-t border-border-custom pt-4 space-y-4">
              <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">Contenido de la Sección</h2>
              {renderVisualForm()}
            </div>
          ) : (
            <>
              <div>
                <label className={labelClass}>Data (JSON)</label>
                <textarea
                  className={`${inputClass} h-48 resize-y`}
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Settings (JSON)</label>
                <textarea
                  className={`${inputClass} h-32 resize-y`}
                  value={form.settings}
                  onChange={(e) => setForm({ ...form, settings: e.target.value })}
                />
              </div>
            </>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-accent" />
            <span className="text-sm text-text-primary">Activa</span>
          </label>

          {mode === 'edit' && editingSection && (
            <div className="border-t border-border-custom pt-5">
              <h3 className="text-sm font-medium text-text-primary mb-4">Media de la sección</h3>
              <div className="flex gap-3 mb-4">
                <input
                  className={inputClass + ' flex-1'}
                  placeholder="URL de imagen o video"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
                <select className={inputClass + ' w-28'} value={mediaType} onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}>
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                </select>
                <Button onClick={handleAddMedia} className="bg-accent text-white hover:bg-accent/90">Añadir</Button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {editingSection.media?.map((m) => (
                  <div key={m.id} className="relative aspect-video bg-bg-tertiary rounded border border-border-custom overflow-hidden group">
                    {m.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={20} className="text-accent" />
                      </div>
                    ) : (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => handleRemoveMedia(m.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewSection && (
          <div className="fixed inset-0 z-[100] bg-bg-primary" onClick={() => setPreviewSection(null)}>
            <div className="absolute top-4 right-4 z-10">
              <button onClick={() => setPreviewSection(null)} className="px-4 py-2 bg-bg-secondary border border-border-custom text-text-primary text-sm rounded hover:bg-bg-tertiary">
                Cerrar Preview
              </button>
            </div>
            <div className="h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
              <SectionRenderer section={previewSection} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-text-primary text-3xl">Secciones</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona el contenido de cada página</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="h-11 px-3 bg-bg-primary border border-border-custom rounded text-text-primary text-sm"
            value={selectedPageId ?? ''}
            onChange={(e) => setSelectedPageId(Number(e.target.value) || null)}
          >
            <option value="">Seleccionar página...</option>
            {pages?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={openCreate}
            disabled={!selectedPageId}
            className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-bg-primary text-sm font-medium rounded hover:bg-accent transition-colors disabled:opacity-40"
          >
            <Plus size={16} /> Nueva Sección
          </button>
        </div>
      </div>

      {!selectedPageId ? (
        <div className="bg-bg-secondary border border-border-custom rounded-lg p-12 text-center">
          <p className="text-text-secondary">Selecciona una página para ver sus secciones</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border-custom rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-custom text-text-muted uppercase text-xs tracking-wider">
                <th className="text-left px-6 py-3 w-16">Orden</th>
                <th className="text-left px-6 py-3">Sección</th>
                <th className="text-left px-6 py-3">Tipo</th>
                <th className="text-left px-6 py-3">Estado</th>
                <th className="text-left px-6 py-3">Media</th>
                <th className="text-left px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {(sections ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    No hay secciones en esta página
                  </td>
                </tr>
              )}
              {(sections ?? []).map((section) => (
                <tr key={section.id} className="group hover:bg-bg-tertiary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveOrder(section, -1)} className="p-1 text-text-muted hover:text-text-primary">
                        <ArrowUp size={14} />
                      </button>
                      <GripVertical size={14} className="text-text-muted" />
                      <button onClick={() => moveOrder(section, 1)} className="p-1 text-text-muted hover:text-text-primary">
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-text-primary font-medium">{section.title || section.type}</div>
                    {section.subtitle && <div className="text-xs text-text-muted">{section.subtitle}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-bg-tertiary text-text-secondary px-2 py-1 rounded uppercase">
                      {section.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => updateMutation.mutate({ id: section.id, isActive: !section.isActive })} className="flex items-center gap-1.5 text-xs">
                      {section.isActive ? (
                        <><Eye size={14} className="text-emerald-400" /> <span className="text-emerald-400">Activa</span></>
                      ) : (
                        <><EyeOff size={14} className="text-text-muted" /> <span className="text-text-muted">Inactiva</span></>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      {section.media && section.media.length > 0 ? (
                        <>
                          <Image size={14} />
                          {section.media.filter((m) => m.type === 'image').length}
                          <Film size={14} className="ml-1" />
                          {section.media.filter((m) => m.type === 'video').length}
                        </>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(section)} className="p-2 text-text-secondary hover:text-accent transition-colors rounded hover:bg-bg-tertiary">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(section.id)} className="p-2 text-text-secondary hover:text-red-400 transition-colors rounded hover:bg-bg-tertiary">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
