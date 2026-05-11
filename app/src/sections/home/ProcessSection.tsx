import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trpc } from '@/providers/trpc';
import { Skeleton } from '@/components/ui/skeleton';

gsap.registerPlugin(ScrollTrigger);

export default function ProcessSection() {
  const ref = useRef<HTMLElement>(null);
  const { data: content, isLoading } = trpc.content.get.useQuery('process');

  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading || !content) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.process-header'), {
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

      gsap.from(el.querySelector('.process-line'), {
        scaleX: 0,
        duration: 1.2,
        ease: 'expo.out',
        transformOrigin: 'left center',
        scrollTrigger: {
          trigger: el.querySelector('.process-steps'),
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      gsap.from(el.querySelectorAll('.process-step'), {
        opacity: 0,
        x: -30,
        duration: 0.8,
        stagger: 0.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el.querySelector('.process-steps'),
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, el);

    return () => ctx.revert();
  }, [isLoading, content]);

  if (isLoading || !content) {
    return (
      <section className="bg-bg-primary py-16 md:py-24 lg:py-32">
        <div className="max-w-content mx-auto px-4 md:px-6 space-y-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-16 w-full" />
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
    steps: Array<{ number: string; title: string; description: string }>;
  };

  return (
    <section ref={ref} className="bg-bg-primary py-16 md:py-24 lg:py-32">
      <div className="max-w-content mx-auto px-4 md:px-6">
        {/* Section Header */}
        <span
          className="process-header font-sans font-medium uppercase tracking-widest text-accent block mb-4"
          style={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}
        >
          {data.sectionLabel}
        </span>
        <h2
          className="process-header font-display text-text-primary"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.01em', lineHeight: 1.2 }}
        >
          {data.sectionTitle}
        </h2>

        {/* Process Steps */}
        <div className="process-steps relative mt-16">
          {/* Connecting Line - desktop only */}
          <div
            className="process-line hidden lg:block absolute top-5 left-0 right-0 h-px bg-border-custom"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
            {data.steps.map((step) => (
              <div key={step.number} className="process-step relative">
                {/* Step Number Circle */}
                <div
                  className="relative z-10 w-10 h-10 rounded-full border border-border-custom flex items-center justify-center bg-bg-primary"
                >
                  <span className="font-sans font-medium text-text-secondary" style={{ fontSize: '0.75rem' }}>
                    {step.number}
                  </span>
                </div>

                <h3
                  className="font-sans font-medium text-text-primary mt-6"
                  style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', letterSpacing: '0.01em', lineHeight: 1.4 }}
                >
                  {step.title}
                </h3>
                <p
                  className="font-sans text-text-secondary mt-2"
                  style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)', lineHeight: 1.7 }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
