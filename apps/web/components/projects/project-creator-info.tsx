import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app';

export type ProjectCreatorInfoProps = {
  creator: string;
  owner: string;
  category: string;
};

export function ProjectCreatorInfo({
  creator,
  owner,
  category,
}: ProjectCreatorInfoProps) {
  return (
    <AppCard className="w-full rounded-[28px] border-0 bg-white p-4 shadow-lg shadow-blue-950/5 ring-1 ring-slate-900/5 sm:p-6">
      <AppCardHeader className="px-0">
        <AppCardTitle className="text-base font-semibold text-slate-900 sm:text-lg">
          Project Creator Information
        </AppCardTitle>
      </AppCardHeader>
      <AppCardContent className="px-0 text-xs text-slate-500 sm:text-sm">
        <dl className="space-y-3 sm:space-y-4">
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Project Owner
            </dt>
            <dd className="break-all font-medium text-slate-900">{creator}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Project Creator Address
            </dt>
            <dd
              className="break-all font-medium text-slate-900"
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              {owner}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Project Category
            </dt>
            <dd className="break-words font-medium text-slate-900">{category}</dd>
          </div>
        </dl>
      </AppCardContent>
    </AppCard>
  );
}
