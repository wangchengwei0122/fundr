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
        'rounded-[28px] border-2 border-dashed border-slate-300 bg-white p-6 sm:p-8',
        className
      )}
    >
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

      <dl className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              'flex flex-col gap-1 sm:flex-row sm:justify-between',
              item.highlight && 'rounded-xl bg-primary/5 p-3'
            )}
          >
            <dt className="text-sm text-slate-500">{item.label}</dt>
            <dd
              className={cn(
                'text-sm font-medium',
                item.highlight ? 'text-primary' : 'text-slate-900'
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {transactionNote && (
        <div className="mt-6 rounded-xl bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">On-chain action: </span>
            {transactionNote}
          </p>
        </div>
      )}
    </div>
  );
}
