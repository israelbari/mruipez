import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trpc } from '@/providers/trpc';
import { Skeleton } from '@/components/ui/skeleton';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(true);

  const { data: content, isLoading } = trpc.content.get.useQuery('hero');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || isLoading || !content) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(el.querySelectorAll('.hero-animate'), { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(document.querySelector('.hero-bg'), {
        scale: 1.05,
        duration: 2,
        ease: 'expo.out',
      });

      gsap.from(el.querySelector('.hero-label'), {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.3,
        ease: 'expo.out',
      });

      gsap.from(el.querySelector('.hero-heading'), {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.5,
        ease: 'expo.out',
      });

      gsap.from(el.querySelector('.hero-sub'), {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.9,
        ease: 'expo.out',
      });

      gsap.from(el.querySelector('.hero-cta'), {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 1.1,
        ease: 'expo.out',
      });

      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        onUpdate: (self) => {
          setScrollIndicatorVisible(self.scroll() < 100);
        },
      });
    }, el);

    return () => ctx.revert();
  }, [isLoading, content]);

  if (isLoading || !content) {
    return (
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-bg-primary">
        <div className="text-center max-w-3xl px-6 space-y-6">
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-20 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <Skeleton className="h-10 w-40 mx-auto" />
        </div>
      </section>
    );
  }

  const data = content.data as {
    label: string;
    heading: string;
    subtext: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-6 pt-16">
        <span
          className="hero-label font-sans font-medium uppercase tracking-widest text-accent block mb-6"
          style={{ fontSize: '0.6875rem', letterSpacing: '0.12em', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
        >
          {data.label}
        </span>

        <h1
          className="hero-heading font-display text-text-primary"
          style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            textShadow: '0 4px 24px rgba(0,0,0,0.7)',
          }}
        >
          {data.heading}
        </h1>

        <p
          className="hero-sub font-sans text-text-secondary mt-6 mx-auto max-w-lg"
          style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)', lineHeight: 1.7, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
        >
          {data.subtext}
        </p>

        <Link
          to={data.ctaLink}
          className="hero-cta inline-block mt-12 font-sans font-medium uppercase tracking-widest text-text-primary border-b border-text-primary pb-1 transition-colors duration-300 hover:text-accent hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          style={{ fontSize: '0.875rem', letterSpacing: '0.06em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
        >
          {data.ctaText}
        </Link>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center transition-opacity duration-300"
        style={{ opacity: scrollIndicatorVisible ? 1 : 0 }}
      >
        <div className="relative w-px h-10 bg-text-muted/50 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-text-muted rounded-full animate-scroll-pulse" />
        </div>
      </div>
    </section>
  );
}
