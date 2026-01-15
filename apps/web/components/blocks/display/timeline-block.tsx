import { cn } from '@/lib/utils';

export type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'upcoming';
};

export type TimelineBlockProps = {
  items: TimelineItem[];
  /** Timeline orientation */
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

const statusStyles = {
  completed: {
    dot: 'bg-emerald-500',
    line: 'bg-emerald-500',
    text: 'text-slate-900',
  },
  current: {
    dot: 'bg-primary ring-4 ring-primary/20',
    line: 'bg-slate-200',
    text: 'text-slate-900 font-medium',
  },
  upcoming: {
    dot: 'bg-slate-200',
    line: 'bg-slate-200',
    text: 'text-slate-400',
  },
};

export function TimelineBlock({
  items,
  orientation = 'vertical',
  className,
}: TimelineBlockProps) {
  if (orientation === 'horizontal') {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <div className="flex min-w-max items-start gap-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex flex-col items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    'h-3 w-3 rounded-full',
                    statusStyles[item.status].dot
                  )}
                />
                {index < items.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-16 sm:w-24',
                      statusStyles[item.status].line
                    )}
                  />
                )}
              </div>
              <div className="mt-3 max-w-[120px] text-center">
                <p className={cn('text-sm', statusStyles[item.status].text)}>
                  {item.title}
                </p>
                {item.timestamp && (
                  <p className="mt-1 text-xs text-slate-400">{item.timestamp}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn('h-3 w-3 rounded-full', statusStyles[item.status].dot)}
            />
            {index < items.length - 1 && (
              <div
                className={cn('w-0.5 flex-1 min-h-[24px]', statusStyles[item.status].line)}
              />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className={cn('text-sm', statusStyles[item.status].text)}>
              {item.title}
            </p>
            {item.description && (
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            )}
            {item.timestamp && (
              <p className="mt-1 text-xs text-slate-400">{item.timestamp}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
