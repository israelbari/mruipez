import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { useLocalMessages } from '@/hooks/useLocalProjects';

gsap.registerPlugin(ScrollTrigger);

export default function ContactForm() {
  const ref = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', projectType: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { add } = useLocalMessages();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0, y: 30, duration: 0.8, delay: 0.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      add(formData);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClasses = "w-full h-12 bg-bg-primary border border-border-custom rounded px-4 text-text-primary font-sans text-base placeholder-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-secondary transition-colors duration-200";
  const labelClasses = "font-sans font-medium uppercase text-text-secondary block mb-2";
  const labelStyle = { fontSize: '0.75rem', letterSpacing: '0.04em' };

  if (status === 'success') {
    return (
      <div ref={ref} className="bg-bg-secondary border border-border-custom rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
        <CheckCircle size={48} strokeWidth={1.5} className="text-accent" />
        <h3 className="font-sans font-medium text-text-primary mt-6" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
          ¡Mensaje enviado!
        </h3>
        <p className="font-sans text-text-secondary mt-2" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)', lineHeight: 1.7 }}>
          Te responderemos en 24 horas.
        </p>
      </div>
    );
  }

  return (
    <div ref={ref} className="bg-bg-secondary border border-border-custom rounded-lg p-8 md:p-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label htmlFor="name" className={labelClasses} style={labelStyle}>Tu nombre</label>
          <input id="name" name="name" type="text" placeholder="Nombre y apellidos" required value={formData.name} onChange={handleChange} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses} style={labelStyle}>Correo electrónico</label>
          <input id="email" name="email" type="email" placeholder="nombre@ejemplo.com" required value={formData.email} onChange={handleChange} className={inputClasses} />
        </div>
        <div className="relative">
          <label htmlFor="projectType" className={labelClasses} style={labelStyle}>Tipo de proyecto</label>
          <select id="projectType" name="projectType" value={formData.projectType} onChange={handleChange} required className={`${inputClasses} appearance-none cursor-pointer pr-10`}>
            <option value="" disabled>Selecciona un tipo</option>
            <option value="residential">Residencial</option>
            <option value="commercial">Comercial</option>
            <option value="interior">Diseño de interiores</option>
            <option value="other">Otro</option>
          </select>
          <ChevronDown size={16} className="absolute right-4 text-text-secondary pointer-events-none" style={{ bottom: '14px' }} />
        </div>
        <div>
          <label htmlFor="message" className={labelClasses} style={labelStyle}>Cuéntanos sobre tu proyecto</label>
          <textarea id="message" name="message" placeholder="Describe tu proyecto, plazo y referencias..." required value={formData.message} onChange={handleChange} rows={6} className={`${inputClasses} h-auto py-4 resize-vertical`} />
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full h-[52px] bg-text-primary text-bg-primary font-sans font-medium uppercase tracking-widest rounded transition-all duration-300 hover:bg-accent hover:text-bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary active:scale-[0.98] disabled:opacity-70"
          style={{ fontSize: '0.875rem', letterSpacing: '0.06em' }}
        >
          {status === 'submitting' ? 'Enviando...' : 'Enviar mensaje'}
        </button>
        {status === 'error' && (
          <p className="font-sans text-red-400" style={{ fontSize: '0.875rem' }}>Algo salió mal. Inténtalo de nuevo.</p>
        )}
      </form>
    </div>
  );
}
