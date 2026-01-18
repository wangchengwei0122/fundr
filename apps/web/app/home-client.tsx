'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { AppButton, AppBadge } from '@/components/app';
import { PageShell } from '@/components/blocks/layout/page-shell';
import { Section } from '@/components/blocks/layout/section';
import { HeroBlock } from '@/components/blocks/display/hero-block';
import { StatBlock } from '@/components/blocks/display/stat-block';
import { ProjectList } from '@/components/projects/project-list';
import type { ProjectSummary } from '@/components/projects/types';
import { formatEth, getDaysLeft, getProgress } from '@/lib/format';
import { PROJECT_STATUS_STYLES, PROJECT_STATUS_LABELS, PLATFORM_STATS } from '@/lib/constants';
import type { ServerProjectSummary } from '@/src/lib/server-fetch';
import { fetchCampaignPage } from '@/src/lib/edge';
import type { EdgeCampaign } from '@/src/lib/edge';

// =============================================================================
// Types
// =============================================================================

type HomeClientProps = {
  initialProjects: ServerProjectSummary[];
  initialNextCursor: number | null;
  initialHasMore: boolean;
  initialSource: 'edge' | 'fallback';
};

type SortKey = 'latest' | 'deadline' | 'progress';

// =============================================================================
// Constants
// =============================================================================

const FALLBACK_FEATURED: ProjectSummary = {
  id: 'eco-farm',
  title: 'Eco-Friendly Urban Agriculture Plan',
  summary:
    'Support the construction of smart vertical farms in urban communities, promote green diet and community sharing.',
  creator: 'GreenThumb DAO',
  goalAmount: 100000,
  pledgedAmount: 75000,
  deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
  status: 'active',
  category: 'Sustainability',
  imageUrl:
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
};

const sortTabs = [
  { key: 'latest' as const, label: 'Newest' },
  { key: 'deadline' as const, label: 'Deadline' },
  { key: 'progress' as const, label: 'Progress' },
];

const FALLBACK_METADATA = {
  title: 'Untitled Project',
  summary: 'Project description is temporarily unavailable.',
  imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  category: 'Unclassified',
};

// =============================================================================
// Helpers
// =============================================================================

/**
 * Convert ServerProjectSummary to ProjectSummary (for compatibility with existing components)
 */
function serverToClientProject(project: ServerProjectSummary): ProjectSummary {
  return {
    id: project.id,
    title: project.title,
    summary: project.summary,
    goalAmount: project.goalAmount,
    pledgedAmount: project.pledgedAmount,
    deadline: project.deadline,
    status: project.status,
    creator: project.creator,
    category: project.category,
    imageUrl: project.imageUrl,
    progress: project.progress,
  };
}

/**
 * Transform EdgeCampaign to ProjectSummary for client-side loaded data
 */
function edgeToClientProject(campaign: EdgeCampaign): ProjectSummary {
  const meta = campaign.metadata;
  const WEI_PER_ETH = 1_000_000_000_000_000_000n;

  const toEth = (value: string) => {
    try {
      const wei = BigInt(value);
      return Number(wei / WEI_PER_ETH) + Number(wei % WEI_PER_ETH) / 1e18;
    } catch {
      return 0;
    }
  };

  const computeProgress = (goal: string, pledged: string) => {
    try {
      const goalWei = BigInt(goal);
      if (goalWei === 0n) return 0;
      const pledgedWei = BigInt(pledged);
      return Math.max(0, Math.min(1, Number((pledgedWei * 10000n) / goalWei) / 10000));
    } catch {
      return 0;
    }
  };

  const statusMap: Record<number, ProjectSummary['status']> = {
    0: 'active',
    1: 'successful',
    2: 'failed',
    3: 'cancelled',
  };

  return {
    id: campaign.address,
    title: meta?.title || FALLBACK_METADATA.title,
    summary: meta?.summary || meta?.description || FALLBACK_METADATA.summary,
    goalAmount: toEth(campaign.goal),
    pledgedAmount: toEth(campaign.totalPledged),
    deadline: new Date(campaign.deadline * 1000).toISOString(),
    status: statusMap[campaign.status] ?? 'active',
    creator: campaign.creator,
    category: meta?.category || FALLBACK_METADATA.category,
    imageUrl: meta?.imageUrl || meta?.image || meta?.cover || FALLBACK_METADATA.imageUrl,
    progress: computeProgress(campaign.goal, campaign.totalPledged),
  };
}

// =============================================================================
// Main Component
// =============================================================================

export function HomeClient({
  initialProjects,
  initialNextCursor,
  initialHasMore,
  initialSource,
}: HomeClientProps) {
  // State
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const [projects, setProjects] = useState<ProjectSummary[]>(() =>
    initialProjects.map(serverToClientProject)
  );
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [source, setSource] = useState(initialSource);

  // Load more projects (client-side)
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || nextCursor === null) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const page = await fetchCampaignPage({ cursor: nextCursor, limit: 12 });
      const newProjects = page.campaigns.map(edgeToClientProject);

      setProjects((prev) => [...prev, ...newProjects]);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
      setSource(page.source);
    } catch (error) {
      console.error('Failed to load more projects', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, nextCursor]);

  // Sort projects
  const sortedProjects = useMemo(() => {
    if (projects.length === 0) return projects;

    if (sortKey === 'deadline') {
      return [...projects].sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
    }
    if (sortKey === 'progress') {
      return [...projects].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
    }
    return projects;
  }, [projects, sortKey]);

  const featured = sortedProjects[0] ?? FALLBACK_FEATURED;
  const remainingProjects = sortedProjects.slice(1);

  return (
    <PageShell paddingY="lg" className="space-y-12 sm:space-y-16">
      {/* Platform Intro Hero */}
      <HeroBlock
        badge="Web3 Crowdfunding Protocol"
        title="Fund the Future, On-Chain"
        subtitle="Transparent, trustless crowdfunding for creators and builders. Every pledge is verified on the blockchain."
        variant="gradient"
        actions={
          <>
            <AppButton size="lg" className="rounded-full px-8" asChild>
              <Link href="/create">Start a Campaign</Link>
            </AppButton>
            <AppButton size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="/projects">Explore Projects</Link>
            </AppButton>
          </>
        }
      />

      {/* Platform Stats */}
      <Section>
        <StatBlock
          layout="grid"
          stats={[
            { label: 'Total Raised', value: PLATFORM_STATS.totalRaised, subtext: PLATFORM_STATS.totalRaisedUsd },
            { label: 'Campaigns', value: PLATFORM_STATS.campaignsCount.toString(), subtext: `Active: ${PLATFORM_STATS.activeCampaigns}` },
            { label: 'Backers', value: PLATFORM_STATS.backersCount.toLocaleString(), subtext: 'Unique wallets' },
            { label: 'Success Rate', value: `${PLATFORM_STATS.successRate}%`, subtext: 'Last 90 days' },
          ]}
        />
      </Section>

      {/* Featured Campaign - Custom Design */}
      <Section title="Featured Campaign">
        <FeaturedCampaign project={featured} />
      </Section>

      {/* How Fundr Works */}
      <Section
        title="How Fundr Works"
        description="Transparent crowdfunding in three simple steps"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <StepCard
            step={1}
            title="Create"
            description="Define your goal, deadline, and tell your story. Deploy your campaign as a smart contract."
          />
          <StepCard
            step={2}
            title="Fund"
            description="Backers pledge ETH directly to your campaign contract. All transactions are on-chain."
          />
          <StepCard
            step={3}
            title="Deliver"
            description="Meet your goal and claim funds. Miss it, backers get automatic refunds."
          />
        </div>
      </Section>

      {/* Active Campaigns */}
      <Section
        title="Active Campaigns"
        description="Discover projects from verified creators"
        action={
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-full bg-muted p-1">
              {sortTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSortKey(tab.key)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-base sm:px-4 sm:text-sm ${sortKey === tab.key ? 'bg-card shadow-soft' : 'text-muted-foreground'}`}
                  disabled={sortKey === tab.key}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <AppButton asChild variant="outline" className="rounded-full px-5 text-sm">
              <Link href="/projects">View All</Link>
            </AppButton>
          </div>
        }
      >
        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load more projects. Please try again later.
          </div>
        )}

        <ProjectList projects={remainingProjects} />

        {projects.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <AppButton
              onClick={loadMore}
              disabled={!hasMore || isLoading}
              variant="outline"
              className="rounded-full px-8"
            >
              {hasMore ? (isLoading ? 'Loading...' : 'Load More') : 'No more projects'}
            </AppButton>
            <p className="text-xs text-muted-foreground">
              Data source: {source === 'edge' ? 'Edge Cache' : 'Chain Fallback'}
            </p>
          </div>
        )}
      </Section>
    </PageShell>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function FeaturedCampaign({ project }: { project: ProjectSummary }) {
  const progress = getProgress(project.pledgedAmount, project.goalAmount);
  const daysLeft = getDaysLeft(project.deadline);
  const hasReachedGoal = project.goalAmount > 0 && project.pledgedAmount >= project.goalAmount;
  const derivedStatus = project.status === 'active' && hasReachedGoal ? 'successful' : project.status;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border transition-base hover:shadow-float hover:glow-primary"
    >
      <div className="grid gap-0 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-full">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-slower group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <AppBadge className="glass rounded-full px-3 py-1 text-xs font-medium text-foreground">
              {project.category}
            </AppBadge>
            <AppBadge
              className={`rounded-full px-3 py-1 text-xs font-semibold ${PROJECT_STATUS_STYLES[derivedStatus]}`}
            >
              {PROJECT_STATUS_LABELS[derivedStatus]}
            </AppBadge>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Featured
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {project.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground sm:text-base">
              {project.summary}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              by <span className="font-medium text-foreground">{project.creator}</span>
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-slower"
                style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground sm:text-3xl">
                  {formatEth(project.pledgedAmount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {formatEth(project.goalAmount)} goal
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground sm:text-3xl">{daysLeft}</p>
                <p className="text-sm text-muted-foreground">days left</p>
              </div>
            </div>

            <AppButton className="w-full rounded-full" size="lg" glow="primary">
              View Campaign
            </AppButton>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card ring-1 ring-border transition-base hover:shadow-float">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
