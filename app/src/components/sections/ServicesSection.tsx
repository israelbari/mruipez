import { Box, Film, Armchair } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { Section } from '@db/schema';

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Box,
  Film,
  Armchair,
};

export default function ServicesSection({ section }: { section: Section }) {
  const data = section.data as {
    sectionLabel?: string;
    sectionTitle?: string;
    items?: Array<{ title: string; description: string; icon: string }>;
  } | undefined;

  const ref = useScrollAnimation<HTMLDivElement>({
    animation: 'fade-up',
    stagger: 0.15,
    children: '.service-card',
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data?.items?.map((item, idx) => {
            const Icon = iconMap[item.icon] ?? Box;
            return (
              <div
                key={idx}
                className="service-card group p-8 border border-border-custom bg-bg-secondary/50 hover:bg-bg-secondary transition-all duration-300"
              >
                <div className="w-12 h-12 flex items-center justify-center border border-accent/30 mb-6">
                  <Icon className="text-accent" size={24} />
                </div>
                <h3 className="font-display text-xl text-text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
