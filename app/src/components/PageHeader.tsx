import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface PageHeaderProps {
  label: string;
  heading: string;
  subtext: string;
}

export default function PageHeader({ label, heading, subtext }: PageHeaderProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.from(el.querySelector('.header-label'), {
        opacity: 0, y: 20, duration: 0.6, ease: 'expo.out',
      })
      .from(el.querySelector('.header-heading'), {
        opacity: 0, y: 40, duration: 1, ease: 'expo.out',
      }, '-=0.3')
      .from(el.querySelector('.header-subtext'), {
        opacity: 0, y: 20, duration: 0.8, ease: 'expo.out',
      }, '-=0.5');
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-bg-primary pt-36 md:pt-44 pb-12">
      <div className="max-w-content mx-auto px-4 md:px-6">
        <span
          className="header-label font-sans font-medium uppercase tracking-widest text-accent block"
          style={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}
        >
          {label}
        </span>
        <h1
          className="header-heading font-display text-text-primary mt-4 max-w-2xl"
          style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          {heading}
        </h1>
        <p
          className="header-subtext font-sans text-text-secondary mt-4 max-w-lg"
          style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)', lineHeight: 1.7 }}
        >
          {subtext}
        </p>
      </div>
    </section>
  );
}
