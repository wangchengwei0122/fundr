import { cn } from '@/lib/utils';

export type SummaryItem = {
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
};

export type SummaryReviewProps = {
  items: SummaryItem[];
  title?: string;
  /** On-chain transaction note */
  transactionNote?: string;
  className?: string;
};

export function SummaryReview({
  items,
  title = 'Review Your Submission',
  transactionNote,
  className,
}: SummaryReviewProps) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed border-border bg-card p-6 sm:p-8',
        className
      )}
    >
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>

      <dl className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              'flex flex-col gap-1 sm:flex-row sm:justify-between',
              item.highlight && 'rounded-xl bg-primary/5 p-3'
            )}
          >
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd
              className={cn(
                'text-sm font-medium',
                item.highlight ? 'text-primary' : 'text-foreground'
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {transactionNote && (
        <div className="mt-6 rounded-xl bg-warning/10 p-4">
          <p className="text-sm text-warning-foreground">
            <span className="font-medium">On-chain action: </span>
            {transactionNote}
          </p>
        </div>
      )}
    </div>
  );
}
