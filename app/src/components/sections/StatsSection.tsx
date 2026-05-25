import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useCountUp } from '@/hooks/useCountUp';
import type { Section } from '@db/schema';

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, displayValue } = useCountUp(value, { suffix, duration: 2 });

  return (
    <div className="stat-item text-center">
      <span ref={ref} className="font-display text-5xl md:text-6xl text-text-primary block mb-2">
        {displayValue}
      </span>
      <span className="text-sm uppercase tracking-wider text-text-secondary">
        {label}
      </span>
    </div>
  );
}

export default function StatsSection({ section }: { section: Section }) {
  const data = section.data as {
    items?: Array<{ value: number; suffix: string; label: string }>;
  } | undefined;

  const ref = useScrollAnimation<HTMLDivElement>({
    animation: 'fade-up',
    stagger: 0.15,
    children: '.stat-item',
  });

  return (
    <div ref={ref} className="relative py-20 md:py-28 bg-bg-secondary/50 border-y border-border-custom">
      <div className="max-w-content mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {data?.items?.map((item, idx) => (
            <StatItem key={idx} value={item.value} suffix={item.suffix} label={item.label} />
          ))}
        </div>
      </div>
    </div>
  );
}
