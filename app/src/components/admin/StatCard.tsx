import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  value: string | number;
  label: string;
  subtext?: string;
  trend?: { value: string; direction: 'up' | 'down' } | null;
}

export default function StatCard({
  icon,
  iconBg = 'bg-accent/10',
  iconColor = 'text-accent',
  value,
  label,
  subtext,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-bg-secondary border border-border-custom rounded-xl p-6 min-h-[140px] flex flex-col justify-between hover:shadow-lg hover:shadow-accent/5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <span className="text-[32px] font-bold leading-tight text-text-primary">{value}</span>
      </div>
      <div className="mt-2">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-text-secondary">
          {label}
        </p>
        {subtext && (
          <p className="text-[11px] text-text-muted mt-0.5">{subtext}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            )}
            <span
              className={`text-[13px] font-medium ${
                trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
