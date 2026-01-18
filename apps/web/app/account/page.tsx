'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

import { AppButton } from '@/components/app';
import { PageShell } from '@/components/blocks/layout/page-shell';
import { Section } from '@/components/blocks/layout/section';
import { IdentityHeader } from '@/components/blocks/identity/identity-header';
import { AssetCard } from '@/components/blocks/display/asset-card';
import { useUserCampaigns, type CampaignInfo } from '@/src/hooks/useUserCampaigns';
import { useSupportedCampaigns } from '@/src/hooks/useSupportedCampaigns';
import { formatEth } from '@/lib/format';
import { PROJECT_STATUS_STYLES, PROJECT_STATUS_LABELS } from '@/lib/constants';

export default function AccountPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const { data: supportedCampaigns = [], isLoading: isLoadingSupported } =
    useSupportedCampaigns(address);
  const { data: userCampaigns = [], isLoading: isLoadingUser } = useUserCampaigns(address);

  // Calculate stats
  const totalPledged = supportedCampaigns.reduce((sum, c) => sum + c.pledgedAmount, 0);
  const totalRaised = userCampaigns.reduce((sum, c) => sum + c.pledgedAmount, 0);

  if (!isConnected || !address) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="rounded-2xl bg-card p-8 text-center shadow-card ring-1 ring-border sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Connect Your Wallet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Connect your wallet to view your on-chain identity and activity
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-8 sm:space-y-12">
      {/* Identity Header */}
      <IdentityHeader
        address={address}
        balance={
          balance
            ? {
                value: Number(formatUnits(balance.value, balance.decimals)).toFixed(4),
                symbol: balance.symbol,
              }
            : undefined
        }
        actions={
          <>
            <AppButton variant="outline" className="rounded-full" disabled>
              Edit Profile
            </AppButton>
            <AppButton asChild className="rounded-full">
              <Link href="/create">Create Campaign</Link>
            </AppButton>
          </>
        }
      />

      {/* Stats Grid */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <AssetCard
            title="Total Pledged"
            value={formatEth(totalPledged)}
            subValue={`${supportedCampaigns.length} campaigns`}
            variant="highlight"
          />
          <AssetCard
            title="Total Raised"
            value={formatEth(totalRaised)}
            subValue={`${userCampaigns.length} campaigns`}
          />
          <AssetCard
            title="Activity Score"
            value={(supportedCampaigns.length + userCampaigns.length * 2).toString()}
            subValue="Based on contributions"
          />
        </div>
      </Section>

      {/* My Campaigns */}
      <Section
        title="My Campaigns"
        description="Campaigns you have created"
        action={
          userCampaigns.length > 4 && (
            <AppButton variant="ghost" size="sm" className="text-muted-foreground">
              View All
            </AppButton>
          )
        }
      >
        {isLoadingUser ? (
          <LoadingGrid />
        ) : userCampaigns.length === 0 ? (
          <EmptyState
            message="You haven't created any campaigns yet"
            action={
              <AppButton asChild className="mt-4 rounded-full">
                <Link href="/create">Create Your First Campaign</Link>
              </AppButton>
            }
          />
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {userCampaigns.slice(0, 4).map((campaign) => (
              <CampaignCard key={campaign.address} campaign={campaign} />
            ))}
          </div>
        )}
      </Section>

      {/* Campaigns I Backed */}
      <Section
        title="Campaigns I Backed"
        description="Projects you have supported"
        action={
          supportedCampaigns.length > 4 && (
            <AppButton variant="ghost" size="sm" className="text-muted-foreground">
              View All
            </AppButton>
          )
        }
      >
        {isLoadingSupported ? (
          <LoadingGrid />
        ) : supportedCampaigns.length === 0 ? (
          <EmptyState
            message="You haven't backed any campaigns yet"
            action={
              <AppButton asChild variant="outline" className="mt-4 rounded-full">
                <Link href="/projects">Explore Campaigns</Link>
              </AppButton>
            }
          />
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {supportedCampaigns.slice(0, 4).map((campaign) => (
              <CampaignCard key={campaign.address} campaign={campaign} />
            ))}
          </div>
        )}
      </Section>
    </PageShell>
  );
}

// Campaign Card Component
function CampaignCard({ campaign }: { campaign: CampaignInfo }) {
  const hasReachedGoal = campaign.goalAmount > 0 && campaign.pledgedAmount >= campaign.goalAmount;
  const derivedStatus = campaign.status === 'active' && hasReachedGoal ? 'successful' : campaign.status;

  return (
    <Link
      href={`/projects/${campaign.address}`}
      className="group flex gap-4 rounded-xl bg-card p-4 shadow-card ring-1 ring-border transition-base hover:-translate-y-0.5 hover:shadow-float sm:p-5"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-20">
        <Image
          src={campaign.imageUrl}
          alt={campaign.title}
          width={80}
          height={80}
          className="h-full w-full object-cover transition-base group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            {campaign.category}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROJECT_STATUS_STYLES[derivedStatus]}`}
          >
            {PROJECT_STATUS_LABELS[derivedStatus]}
          </span>
        </div>
        <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-primary sm:text-lg">
          {campaign.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{Math.round(campaign.progress * 100)}% funded</span>
          <span>{formatEth(campaign.pledgedAmount)}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/80"
            style={{ width: `${Math.min(100, Math.round(campaign.progress * 100))}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

// Loading Grid
function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-xl bg-muted/60"
        />
      ))}
    </div>
  );
}

// Empty State
function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
