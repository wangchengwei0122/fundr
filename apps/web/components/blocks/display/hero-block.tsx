import { cn } from '@/lib/utils';

export type HeroBlockProps = {
  /** Main headline */
  title: string;
  /** Supporting text */
  subtitle?: string;
  /** Highlight badge text */
  badge?: string;
  /** Action buttons */
  actions?: React.ReactNode;
  /** Background variant */
  variant?: 'default' | 'gradient' | 'subtle';
  className?: string;
};

const variantStyles = {
  default: 'bg-white',
  gradient: 'bg-gradient-to-br from-slate-50 to-slate-100',
  subtle: 'bg-slate-50/50',
};

export function HeroBlock({
  title,
  subtitle,
  badge,
  actions,
  variant = 'default',
  className,
}: HeroBlockProps) {
  return (
    <div
      className={cn(
        'rounded-[32px] p-8 sm:p-12 lg:p-16',
        'shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5',
        variantStyles[variant],
        className
      )}
    >
      <div className="mx-auto max-w-3xl text-center">
        {badge && (
          <span className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            {badge}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg text-slate-600 sm:text-xl">{subtitle}</p>
        )}
        {actions && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">{actions}</div>
        )}
      </div>
    </div>
  );
}
