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
    <AppCard className="w-full rounded-xl border-0 bg-card p-4 shadow-card ring-1 ring-border sm:p-6">
      <AppCardHeader className="px-0">
        <AppCardTitle className="text-base font-semibold text-foreground sm:text-lg">
          Project Creator Information
        </AppCardTitle>
      </AppCardHeader>
      <AppCardContent className="px-0 text-xs text-muted-foreground sm:text-sm">
        <dl className="space-y-3 sm:space-y-4">
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">
              Project Owner
            </dt>
            <dd className="break-all font-medium text-foreground">{creator}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">
              Project Creator Address
            </dt>
            <dd
              className="break-all font-medium text-foreground"
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              {owner}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">
              Project Category
            </dt>
            <dd className="break-words font-medium text-foreground">{category}</dd>
          </div>
        </dl>
      </AppCardContent>
    </AppCard>
  );
}
