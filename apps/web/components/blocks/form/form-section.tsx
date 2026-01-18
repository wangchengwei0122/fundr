import { cn } from '@/lib/utils';
import {
  AppCard,
  AppCardContent,
  AppCardDescription,
  AppCardHeader,
  AppCardTitle,
} from '@/components/app';

export type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** On-chain action hint */
  onChainHint?: string;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  onChainHint,
  className,
}: FormSectionProps) {
  return (
    <AppCard
      className={cn(
        'rounded-[28px] border-0 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5',
        className
      )}
    >
      <AppCardHeader className="px-6 sm:px-8">
        <AppCardTitle className="text-lg text-slate-900 sm:text-xl">{title}</AppCardTitle>
        {description && (
          <AppCardDescription className="text-sm text-slate-500">
            {description}
          </AppCardDescription>
        )}
      </AppCardHeader>
      <AppCardContent className="space-y-4 px-6 pb-6 sm:space-y-6 sm:px-8 sm:pb-8">
        {children}
      </AppCardContent>
      {onChainHint && (
        <div className="border-t border-slate-100 px-6 py-4 sm:px-8">
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-primary/60" />
            {onChainHint}
          </p>
        </div>
      )}
    </AppCard>
  );
}
