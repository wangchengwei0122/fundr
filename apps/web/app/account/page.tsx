'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

import { Button } from '@/components/ui/button';
import { useUserCampaigns, type CampaignInfo } from '@/src/hooks/useUserCampaigns';
import { useSupportedCampaigns } from '@/src/hooks/useSupportedCampaigns';

const profile = {
  avatar:
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80',
  bio: 'Exploring new possibilities in Web3 crowdfunding, focusing on sustainability and creative technology.',
};

type ProjectCardProps = {
  campaign: CampaignInfo;
};

function ProjectCard({ campaign }: ProjectCardProps) {
  const statusColors: Record<CampaignInfo['status'], string> = {
    active: 'bg-blue-100 text-blue-600',
    successful: 'bg-emerald-100 text-emerald-600',
    failed: 'bg-rose-100 text-rose-600',
    cancelled: 'bg-slate-100 text-slate-500',
  };

  const statusLabels: Record<CampaignInfo['status'], string> = {
    active: 'In Progress',
    successful: 'Successful',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };

  return (
    <article className="group flex w-full max-w-full flex-col gap-4 rounded-3xl bg-white p-4 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 transition hover:-translate-y-1 hover:shadow-xl sm:gap-5 sm:p-6">
      <div className="flex w-full max-w-full items-start gap-3 sm:gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-20 sm:w-20">
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-sky-500">
              {campaign.category}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[campaign.status]}`}
            >
              {statusLabels[campaign.status]}
            </span>
          </div>
          <h3 className="break-words text-base font-semibold text-slate-900 sm:text-lg">{campaign.title}</h3>
          <p className="line-clamp-2 text-xs text-slate-500 sm:text-sm">{campaign.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 sm:gap-4">
            <span className="break-words">
              Progress: {Math.round(campaign.progress * 100)}% · Pledged{' '}
              {campaign.pledgedAmount.toFixed(4)} ETH
            </span>
          </div>
        </div>
      </div>
      <div className="w-full max-w-full">
        <Button asChild variant="outline" className="w-full rounded-full px-4 py-2 text-sm sm:w-auto">
          <Link href={`/projects/${campaign.address}`}>View Project</Link>
        </Button>
      </div>
    </article>
  );
}

function ProjectSection({
  title,
  campaigns,
  isLoading,
}: {
  title: string;
  campaigns: CampaignInfo[];
  isLoading: boolean;
}) {
  return (
    <section className="w-full max-w-full space-y-5">
      <div className="flex w-full max-w-full items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
        {campaigns.length > 0 && (
          <Button variant="ghost" className="text-xs text-slate-500 hover:text-slate-900 sm:text-sm">
            View All
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-500 sm:text-sm">Loading...</div>
      ) : campaigns.length === 0 ? (
        <div className="w-full max-w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
          <p className="text-xs text-slate-500 sm:text-sm">No projects</p>
        </div>
      ) : (
        <div className="grid w-full max-w-full grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <ProjectCard key={campaign.address} campaign={campaign} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function AccountPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const { data: supportedCampaigns = [], isLoading: isLoadingSupported } =
    useSupportedCampaigns(address);
  const { data: userCampaigns = [], isLoading: isLoadingUser } = useUserCampaigns(address);

  if (!isConnected || !address) {
    return (
      <main className="mx-auto flex w-full max-w-full flex-col gap-8 overflow-x-hidden px-4 py-8 sm:max-w-6xl sm:gap-12 sm:px-6 sm:py-12">
        <section className="w-full max-w-full rounded-[32px] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-8">
          <div className="py-8 text-center">
            <p className="text-xs text-slate-500 sm:text-sm">Please connect your wallet to view your account information</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-full flex-col gap-8 overflow-x-hidden px-4 py-8 sm:max-w-6xl sm:gap-12 sm:px-6 sm:py-12">
      <section className="w-full max-w-full rounded-[32px] bg-white p-4 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-8">
        <div className="flex w-full max-w-full flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-full items-center gap-4 sm:gap-6">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 sm:h-20 sm:w-20">
              <Image src={profile.avatar} alt="Profile" width={80} height={80} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
              <h1 className="break-all text-xl font-semibold text-slate-900 sm:text-2xl">
                {address.slice(0, 6)}...{address.slice(-4)}
              </h1>
              <p className="break-words text-xs text-slate-500 sm:text-sm">
                Balance: {balance ? formatUnits(balance.value, balance.decimals) : '—'}{' '}
                {balance?.symbol}
              </p>
              <p className="break-all text-xs text-slate-400">{address}</p>
            </div>
          </div>
          <div className="flex w-full max-w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <Button variant="outline" className="w-full rounded-full px-5 sm:w-auto" disabled>
              Edit Profile
            </Button>
            <Button asChild className="w-full rounded-full px-5 sm:w-auto">
              <Link href="/create">Create Project</Link>
            </Button>
          </div>
        </div>
      </section>

      <ProjectSection
        title="Projects I Supported"
        campaigns={supportedCampaigns}
        isLoading={isLoadingSupported}
      />
      <ProjectSection title="Projects I Created" campaigns={userCampaigns} isLoading={isLoadingUser} />
    </main>
  );
}
