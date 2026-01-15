import { cn } from '@/lib/utils';

export type SectionProps = {
  children: React.ReactNode;
  className?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Right-side action element */
  action?: React.ReactNode;
  /** Internal spacing */
  spacing?: 'sm' | 'md' | 'lg';
};

const spacingMap = {
  sm: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
};

export function Section({
  children,
  className,
  title,
  description,
  action,
  spacing = 'md',
}: SectionProps) {
  return (
    <section className={cn(spacingMap[spacing], className)}>
      {(title || description || action) && (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
