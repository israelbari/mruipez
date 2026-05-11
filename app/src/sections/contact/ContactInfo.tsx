import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin } from 'lucide-react';
import { contactInfo } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { icon: Mail, label: 'Correo', value: contactInfo.email },
  { icon: Phone, label: 'Teléfono', value: contactInfo.phone },
  { icon: MapPin, label: 'Ubicación', value: contactInfo.location },
];

export default function ContactInfo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.contact-item'), {
        opacity: 0,
        x: -20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref}>
      <span
        className="font-sans font-medium uppercase tracking-widest text-accent block mb-8"
        style={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}
      >
        Datos de contacto
      </span>

      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="contact-item flex items-start gap-4">
              <Icon size={20} strokeWidth={1.5} className="text-accent mt-0.5 shrink-0" />
              <div>
                <span
                  className="font-sans font-medium uppercase text-text-secondary block"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.06em' }}
                >
                  {item.label}
                </span>
                <span className="font-sans text-text-primary mt-1 block" style={{ fontSize: '1rem' }}>
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Social Links */}
      <div className="mt-12">
        <span
          className="font-sans font-medium uppercase tracking-widest text-text-secondary block mb-4"
          style={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}
        >
          Síguenos
        </span>
        <div className="flex gap-6">
          {['Instagram', 'Behance', 'LinkedIn'].map((social) => (
            <span
              key={social}
              className="font-sans text-text-primary cursor-default"
              style={{ fontSize: '0.875rem' }}
            >
              {social}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
