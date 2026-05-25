import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { Section, SectionMedia } from '@db/schema';
import LightboxModal from '@/components/LightboxModal';

interface SectionWithMedia extends Section {
  media?: SectionMedia[];
}

export default function GallerySection({ section }: { section: SectionWithMedia }) {
  const data = section.data as {
    sectionLabel?: string;
    sectionTitle?: string;
    layout?: 'grid' | 'masonry';
  } | undefined;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const images = (section.media ?? []).filter((m) => m.type === 'image');

  const ref = useScrollAnimation<HTMLDivElement>({
    animation: 'fade-up',
    stagger: 0.1,
    children: '.gallery-item',
  });

  return (
    <div ref={ref} className="relative py-24 md:py-32">
      <div className="max-w-content mx-auto px-4 md:px-6">
        {(data?.sectionLabel || data?.sectionTitle) && (
          <div className="text-center mb-16">
            {data.sectionLabel && (
              <span className="text-xs uppercase tracking-[0.2em] text-accent mb-4 block">
                {data.sectionLabel}
              </span>
            )}
            {data.sectionTitle && (
              <h2 className="font-display text-3xl md:text-4xl text-text-primary">
                {data.sectionTitle}
              </h2>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="gallery-item relative aspect-[4/3] overflow-hidden cursor-pointer group"
              onClick={() => setLightboxIndex(idx)}
            >
              <img
                src={img.url}
                alt={img.caption ?? ''}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                {img.caption && (
                  <span className="text-sm text-text-primary">{img.caption}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <LightboxModal
          images={images.map((i) => i.url)}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
