import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { Section } from '@db/schema';

export default function CTASection({ section }: { section: Section }) {
  const data = section.data as {
    heading?: string;
    subtext?: string;
    ctaText?: string;
    ctaLink?: string;
  } | undefined;

  const ref = useScrollAnimation<HTMLDivElement>({
    animation: 'fade-up',
    duration: 1,
  });

  return (
    <div ref={ref} className="relative py-24 md:py-32">
      <div className="max-w-content mx-auto px-4 md:px-6 text-center">
        {data?.heading && (
          <h2 className="font-display text-3xl md:text-5xl text-text-primary mb-6">
            {data.heading}
          </h2>
        )}
        {data?.subtext && (
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
            {data.subtext}
          </p>
        )}
        {data?.ctaText && data?.ctaLink && (
          <a
            href={data.ctaLink}
            className="inline-flex items-center gap-2 px-8 py-4 border border-accent text-accent font-medium text-sm uppercase tracking-wider hover:bg-accent hover:text-bg-primary transition-colors"
          >
            {data.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}
