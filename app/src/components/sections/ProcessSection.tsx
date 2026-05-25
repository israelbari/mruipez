import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { Section } from '@db/schema';

export default function ProcessSection({ section }: { section: Section }) {
  const data = section.data as {
    sectionLabel?: string;
    sectionTitle?: string;
    steps?: Array<{ number: string; title: string; description: string }>;
  } | undefined;

  const ref = useScrollAnimation<HTMLDivElement>({
    animation: 'fade-up',
    stagger: 0.2,
    children: '.process-step',
  });

  return (
    <div ref={ref} className="relative py-24 md:py-32 bg-bg-secondary/30">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data?.steps?.map((step, idx) => (
            <div key={idx} className="process-step relative">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-display text-5xl text-accent/20">
                  {step.number}
                </span>
                {idx < (data.steps?.length ?? 0) - 1 && (
                  <div className="hidden lg:block flex-1 h-px bg-border-custom" />
                )}
              </div>
              <h3 className="font-display text-lg text-text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
