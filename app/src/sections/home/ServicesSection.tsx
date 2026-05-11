import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trpc } from '@/providers/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Box, Film, Armchair, type LucideIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, LucideIcon> = {
  Box,
  Film,
  Armchair,
};

export default function ServicesSection() {
  const ref = useRef<HTMLElement>(null);
  const { data: content, isLoading } = trpc.content.get.useQuery('services');

  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading || !content) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.services-header'), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      gsap.from(el.querySelectorAll('.service-card'), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el.querySelector('.services-grid'),
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, el);

    return () => ctx.revert();
  }, [isLoading, content]);

  if (isLoading || !content) {
    return (
      <section className="bg-bg-primary py-24 md:py-32 lg:py-40">
        <div className="max-w-content mx-auto px-4 md:px-6 space-y-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-12 w-12" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const data = content.data as {
    sectionLabel: string;
    sectionTitle: string;
    items: Array<{ title: string; description: string; icon: string }>;
  };

  return (
    <section ref={ref} className="bg-bg-primary py-24 md:py-32 lg:py-40">
      <div className="max-w-content mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div>
          <span
            className="services-header font-sans font-medium uppercase tracking-widest text-accent block mb-4"
            style={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}
          >
            {data.sectionLabel}
          </span>
          <h2
            className="services-header font-display text-text-primary max-w-xl"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.01em', lineHeight: 1.2 }}
          >
            {data.sectionTitle}
          </h2>
        </div>

        {/* Services Grid */}
        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">
          {data.items.map((service) => {
            const Icon = iconMap[service.icon] || Box;
            return (
              <div key={service.title} className="service-card">
                <Icon
                  size={48}
                  strokeWidth={1.5}
                  className="text-accent"
                />
                <h3
                  className="font-sans font-medium text-text-primary mt-6"
                  style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', letterSpacing: '0.01em', lineHeight: 1.4 }}
                >
                  {service.title}
                </h3>
                <p
                  className="font-sans text-text-secondary mt-3 max-w-xs"
                  style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)', lineHeight: 1.7 }}
                >
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mt-24 md:mt-32 w-full h-px bg-border-custom" />
      </div>
    </section>
  );
}
