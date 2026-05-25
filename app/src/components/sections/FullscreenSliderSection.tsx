import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Section, SectionMedia } from '@db/schema';

interface SectionWithMedia extends Section {
  media?: SectionMedia[];
}

export default function FullscreenSliderSection({ section }: { section: SectionWithMedia }) {
  const data = section.data as {
    sectionLabel?: string;
    sectionTitle?: string;
  } | undefined;

  const settings = (section.settings ?? {}) as {
    autoplay?: boolean;
    interval?: number;
    transition?: string;
  };

  const items = section.media ?? [];
  const [current, setCurrent] = useState(0);
  const autoplay = settings.autoplay ?? true;
  const interval = settings.interval ?? 5000;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!autoplay || items.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, next, items.length]);

  if (items.length === 0) return null;

  return (
    <div className="relative h-[80vh] md:h-screen overflow-hidden">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {item.type === 'video' ? (
            <video
              src={item.url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${item.url})`,
                transform: idx === current ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 6s ease-out',
              }}
            />
          )}
          <div className="absolute inset-0 bg-bg-primary/30" />
        </div>
      ))}

      {/* Controls */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center border border-text-primary/30 text-text-primary hover:bg-text-primary hover:text-bg-primary transition-colors z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center border border-text-primary/30 text-text-primary hover:bg-text-primary hover:text-bg-primary transition-colors z-10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-12 h-0.5 transition-colors ${
                  idx === current ? 'bg-accent' : 'bg-text-primary/30'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Content overlay */}
      {(data?.sectionLabel || data?.sectionTitle) && (
        <div className="absolute bottom-20 left-0 right-0 z-10 text-center px-4">
          {data.sectionLabel && (
            <span className="text-xs uppercase tracking-[0.2em] text-accent mb-4 block">
              {data.sectionLabel}
            </span>
          )}
          {data.sectionTitle && (
            <h2 className="font-display text-3xl md:text-5xl text-text-primary">
              {data.sectionTitle}
            </h2>
          )}
        </div>
      )}
    </div>
  );
}
