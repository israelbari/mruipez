import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { Section, SectionMedia } from '@db/schema';
import VideoPlayer from '@/components/VideoPlayer';

interface SectionWithMedia extends Section {
  media?: SectionMedia[];
}

export default function HeroSection({ section }: { section: SectionWithMedia }) {
  const data = section.data as {
    label?: string;
    heading?: string;
    subtext?: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundImage?: string;
  } | undefined;

  const settings = (section.settings ?? {}) as {
    backgroundType?: 'video' | 'image' | 'gradient' | 'solid';
    overlayOpacity?: number;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.3,
        }
      );

      gsap.to('.hero-bg-media', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const bgType = settings.backgroundType ?? 'video';
  const overlayOpacity = settings.overlayOpacity ?? 0.4;
  const bgUrl = data?.backgroundImage ?? '/videos/hero-bg.mp4';
  const isVideoBg = bgType === 'video' || bgUrl.endsWith('.mp4') || bgUrl.endsWith('.webm');

  return (
    <div ref={containerRef} className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {isVideoBg ? (
        <div className="hero-bg-media absolute inset-0">
          <VideoPlayer
            src={bgUrl}
            className="w-full h-full object-cover"
            autoPlay={settings.autoplay ?? true}
            loop={settings.loop ?? true}
            muted={settings.muted ?? true}
            playsInline
          />
        </div>
      ) : (
        <div
          className="hero-bg-media absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}

      <div
        className="absolute inset-0 bg-bg-primary"
        style={{ opacity: overlayOpacity }}
      />

      <div ref={contentRef} className="relative z-10 max-w-content mx-auto px-4 md:px-6 text-center py-32">
        {data?.label && (
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-accent mb-6">
            {data.label}
          </span>
        )}
        {data?.heading && (
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-text-primary mb-6 leading-tight">
            {data.heading}
          </h1>
        )}
        {data?.subtext && (
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            {data.subtext}
          </p>
        )}
        {data?.ctaText && data?.ctaLink && (
          <a
            href={data.ctaLink}
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-bg-primary font-medium text-sm uppercase tracking-wider hover:bg-accent/90 transition-colors"
          >
            {data.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}
