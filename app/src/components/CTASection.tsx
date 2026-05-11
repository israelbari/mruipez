import { Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CTASectionProps {
  heading: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
}

export default function CTASection({ heading, subtext, ctaText, ctaLink }: CTASectionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.cta-animate'), {
        opacity: 0, y: 30, duration: 0.8, stagger: 0.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-bg-primary py-24 md:py-32 lg:py-40">
      <div className="max-w-content mx-auto px-4 md:px-6 text-center">
        <h2
          className="cta-animate font-display text-text-primary"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.01em', lineHeight: 1.2 }}
        >
          {heading}
        </h2>
        <p className="cta-animate font-sans text-text-secondary mt-4" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)', lineHeight: 1.7 }}>
          {subtext}
        </p>
        <Link
          to={ctaLink}
          className="cta-animate inline-block mt-8 font-sans font-medium uppercase tracking-widest text-text-primary border-b border-text-primary pb-1 transition-colors duration-300 hover:text-accent hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          style={{ fontSize: '0.875rem', letterSpacing: '0.06em' }}
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
