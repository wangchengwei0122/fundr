import { cn } from '@/lib/utils';

export type AssetCardProps = {
  /** Asset title */
  title: string;
  /** Asset value (e.g., "10.5 ETH") */
  value: string;
  /** Secondary value (e.g., "$25,000") */
  subValue?: string;
  /** Change indicator */
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  /** Icon element */
  icon?: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'highlight' | 'muted';
  className?: string;
};

const trendColors = {
  up: 'text-emerald-600',
  down: 'text-rose-600',
  neutral: 'text-slate-500',
};

export function AssetCard({
  title,
  value,
  subValue,
  change,
  icon,
  variant = 'default',
  className,
}: AssetCardProps) {
  return (
    <div
      className={cn(
        'rounded-[24px] border-0 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5',
        variant === 'default' && 'bg-white',
        variant === 'highlight' && 'bg-primary/5 ring-primary/20',
        variant === 'muted' && 'bg-slate-50',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 sm:text-3xl">{value}</div>
        {(subValue || change) && (
          <div className="mt-1 flex items-center gap-2 text-sm">
            {subValue && <span className="text-slate-500">{subValue}</span>}
            {change && (
              <span className={cn('font-medium', trendColors[change.trend])}>
                {change.trend === 'up' && '\u2191'}
                {change.trend === 'down' && '\u2193'}
                {change.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
