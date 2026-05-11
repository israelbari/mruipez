import { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocalProjects } from '@/hooks/useLocalProjects';
import LightboxModal from '@/components/LightboxModal';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedWorkSection() {
  const ref = useRef<HTMLElement>(null);
  const { projects } = useLocalProjects();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const featured = projects.filter(p => p.featured);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.featured-header'), {
        opacity: 0, y: 30, duration: 0.8, stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
      });

      gsap.from(el.querySelectorAll('.featured-card'), {
        opacity: 0, y: 60, duration: 0.9, stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el.querySelector('.featured-grid'), start: 'top 80%', toggleActions: 'play none none none' },
      });
    }, el);
    return () => ctx.revert();
  }, [featured]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <>
      <section ref={ref} className="bg-bg-primary py-16 md:py-24 lg:py-32">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
            <div>
              <span className="featured-header font-sans font-medium uppercase tracking-widest text-accent block" style={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
                Proyectos Destacados
              </span>
              <h2 className="featured-header font-display text-text-primary mt-4 max-w-xl" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Renders que hablan más que los planos
              </h2>
            </div>
            <Link to="/work" className="featured-header font-sans uppercase tracking-widest text-text-secondary transition-colors duration-300 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded shrink-0" style={{ fontSize: '0.8125rem', letterSpacing: '0.06em' }}>
              Ver todos los proyectos &rarr;
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="mt-16 text-text-secondary">Aún no hay proyectos destacados.</div>
          ) : (
            <div className="featured-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
              {featured[0] && (
                <div className="featured-card md:col-span-2 group relative overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
                  <img src={featured[0].image} alt={featured[0].name} loading="lazy" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ aspectRatio: '16/10', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <h3 className="font-sans font-medium text-text-primary" style={{ fontSize: '0.875rem' }}>{featured[0].name}</h3>
                  </div>
                </div>
              )}
              {featured[1] && (
                <div className="featured-card group relative overflow-hidden cursor-pointer" onClick={() => openLightbox(1)}>
                  <img src={featured[1].image} alt={featured[1].name} loading="lazy" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ aspectRatio: '4/5', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <h3 className="font-sans font-medium text-text-primary" style={{ fontSize: '0.875rem' }}>{featured[1].name}</h3>
                  </div>
                </div>
              )}

              {[2, 3].map((idx) => featured[idx] && (
                <div key={featured[idx].id} className="featured-card group relative overflow-hidden cursor-pointer" onClick={() => openLightbox(idx)}>
                  <img src={featured[idx].image} alt={featured[idx].name} loading="lazy" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ aspectRatio: '4/5', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <h3 className="font-sans font-medium text-text-primary" style={{ fontSize: '0.875rem' }}>{featured[idx].name}</h3>
                  </div>
                </div>
              ))}

              {featured[4] && (
                <div className="featured-card md:col-span-2 group relative overflow-hidden cursor-pointer" onClick={() => openLightbox(4)}>
                  <img src={featured[4].image} alt={featured[4].name} loading="lazy" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ aspectRatio: '16/10', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <h3 className="font-sans font-medium text-text-primary" style={{ fontSize: '0.875rem' }}>{featured[4].name}</h3>
                  </div>
                </div>
              )}
              {featured[5] && (
                <div className="featured-card group relative overflow-hidden cursor-pointer" onClick={() => openLightbox(5)}>
                  <img src={featured[5].image} alt={featured[5].name} loading="lazy" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ aspectRatio: '4/5', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <h3 className="font-sans font-medium text-text-primary" style={{ fontSize: '0.875rem' }}>{featured[5].name}</h3>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/work" className="font-sans uppercase tracking-widest text-text-secondary transition-colors duration-300 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded" style={{ fontSize: '0.8125rem', letterSpacing: '0.06em' }}>
              Ver portafolio completo &rarr;
            </Link>
          </div>
        </div>
      </section>

      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
        projects={featured}
      />
    </>
  );
}
