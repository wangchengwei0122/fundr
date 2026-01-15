import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
    <Card
      className={cn(
        'rounded-[28px] border-0 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5',
        className
      )}
    >
      <CardHeader className="px-6 sm:px-8">
        <CardTitle className="text-lg text-slate-900 sm:text-xl">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-slate-500">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6 sm:space-y-6 sm:px-8 sm:pb-8">
        {children}
      </CardContent>
      {onChainHint && (
        <div className="border-t border-slate-100 px-6 py-4 sm:px-8">
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-primary/60" />
            {onChainHint}
          </p>
        </div>
      )}
    </Card>
  );
}
