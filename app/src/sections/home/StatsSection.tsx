import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trpc } from '@/providers/trpc';
import { Skeleton } from '@/components/ui/skeleton';

gsap.registerPlugin(ScrollTrigger);

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: value,
          duration: 1.5,
          ease: 'expo.out',
          onUpdate: () => {
            setCount(Math.round(obj.val));
          },
        });
      },
      once: true,
    });

    return () => trigger.kill();
  }, [value]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const { data: content, isLoading } = trpc.content.get.useQuery('stats');

  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading || !content) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.stat-item'), {
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
    }, el);

    return () => ctx.revert();
  }, [isLoading, content]);

  if (isLoading || !content) {
    return (
      <section className="bg-bg-secondary py-16 md:py-24">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-12 w-24 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const data = content.data as {
    items: Array<{ value: number; suffix: string; label: string }>;
  };

  return (
    <section ref={ref} className="bg-bg-secondary py-16 md:py-24">
      <div className="max-w-content mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {data.items.map((stat) => (
            <div key={stat.label} className="stat-item text-center">
              <div
                className="font-display text-text-primary"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.02em', lineHeight: 1 }}
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p
                className="font-sans uppercase text-text-secondary mt-2"
                style={{ fontSize: '0.75rem', letterSpacing: '0.06em' }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
