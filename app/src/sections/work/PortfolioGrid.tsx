import { useState, useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocalProjects } from '@/hooks/useLocalProjects';
import ProjectCard from '@/components/ProjectCard';
import LightboxModal from '@/components/LightboxModal';
import VideoPlayer from '@/components/VideoPlayer';

gsap.registerPlugin(ScrollTrigger);

const categories = ['Todos', 'Residencial', 'Comercial', 'Interiores', 'Exteriores'];

export default function PortfolioGrid() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const { projects } = useLocalProjects();

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Interiores') return p.subcategory === 'Interiors';
    if (activeFilter === 'Exteriores') return p.subcategory === 'Exteriors';
    if (activeFilter === 'Residencial') return p.category === 'Residential';
    if (activeFilter === 'Comercial') return p.category === 'Commercial';
    return true;
  });

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.portfolio-card'), {
        opacity: 0, y: 50, duration: 0.8, stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      });
    }, el);
    return () => ctx.revert();
  }, [activeFilter, filteredProjects]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <>
      <div className="max-w-content mx-auto px-4 md:px-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className="font-sans uppercase tracking-widest px-4 py-2 rounded transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              style={{
                fontSize: '0.8125rem', letterSpacing: '0.06em',
                backgroundColor: activeFilter === cat ? '#C9CACA' : 'transparent',
                color: activeFilter === cat ? '#121212' : '#868686',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div ref={gridRef} className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {filteredProjects.map((project, idx) => (
            <div key={project.id} className="portfolio-card break-inside-avoid mb-4">
              {project.video ? (
                <div className="rounded overflow-hidden">
                  <VideoPlayer src={project.video} poster={project.image} className="w-full" />
                  <div className="p-3 bg-bg-secondary border border-t-0 border-border-custom">
                    <h3 className="font-sans font-medium text-text-primary text-sm">{project.name}</h3>
                    <p className="font-sans uppercase text-text-muted mt-1" style={{ fontSize: '0.6875rem', letterSpacing: '0.06em' }}>
                      {project.category} / {project.subcategory}
                    </p>
                  </div>
                </div>
              ) : (
                <ProjectCard project={project} onClick={() => openLightbox(idx)} />
              )}
            </div>
          ))}
        </div>
      </div>

      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
        projects={filteredProjects}
      />
    </>
  );
}
