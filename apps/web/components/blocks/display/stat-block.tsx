import { cn } from '@/lib/utils';

export type StatItem = {
  label: string;
  value: string | number;
  subtext?: string;
};

export type StatBlockProps = {
  stats: StatItem[];
  /** Layout direction */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Show dividers between items */
  divided?: boolean;
  className?: string;
};

export function StatBlock({
  stats,
  layout = 'horizontal',
  divided = true,
  className,
}: StatBlockProps) {
  const layoutClass = {
    horizontal: 'flex flex-wrap gap-6 sm:gap-8',
    vertical: 'flex flex-col gap-4',
    grid: 'grid grid-cols-2 gap-4 sm:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'rounded-xl bg-muted/50 p-4 sm:p-6',
        layoutClass[layout],
        className
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            layout === 'horizontal' &&
              divided &&
              index > 0 &&
              'border-l border-border pl-6 sm:pl-8'
          )}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
            {stat.label}
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
            {stat.value}
          </p>
          {stat.subtext && (
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
}
