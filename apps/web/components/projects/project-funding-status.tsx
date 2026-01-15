import { formatEth, getProgress, getDaysLeft } from '@/lib/format';
import { PROJECT_STATUS_STYLES, PROJECT_STATUS_LABELS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import type { ProjectStatus } from './types';

export type ProjectFundingStatusProps = {
  pledgedAmount: number;
  goalAmount: number;
  deadline: string;
  backerCount: number;
  status: ProjectStatus;
};

export function ProjectFundingStatus({
  pledgedAmount,
  goalAmount,
  deadline,
  backerCount,
  status,
}: ProjectFundingStatusProps) {
  const progress = getProgress(pledgedAmount, goalAmount);
  const daysLeft = getDaysLeft(deadline);
  const hasReachedGoal = goalAmount > 0 && pledgedAmount >= goalAmount;
  const derivedStatus: ProjectStatus =
    status === 'active' && hasReachedGoal ? 'successful' : status;

  return (
    <div className="grid w-full gap-4 rounded-[24px] bg-slate-50 p-4 sm:gap-6 sm:p-6">
      <div className="flex items-center justify-between">
        <Badge
          className={`rounded-full px-3 py-1 text-xs font-semibold ${PROJECT_STATUS_STYLES[derivedStatus]}`}
        >
          {PROJECT_STATUS_LABELS[derivedStatus]}
        </Badge>
        <span className="text-xs text-slate-500">
          {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
        </span>
      </div>

      <div className="grid w-full gap-4 text-xs text-slate-500 sm:gap-6 sm:text-sm md:grid-cols-2">
        <div className="w-full">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Pledged Amount
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
            {formatEth(pledgedAmount)}
          </p>
          <p className="text-xs">Completed {Math.round(progress * 100)}%</p>
        </div>
        <div className="w-full">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Goal Amount
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
            {formatEth(goalAmount)}
          </p>
          <p className="text-xs">
            {backerCount} backer{backerCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-white/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500"
          style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
        />
      </div>
    </div>
  );
}
