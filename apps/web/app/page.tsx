'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { AppButton, AppBadge } from '@/components/app';
import { PageShell } from '@/components/blocks/layout/page-shell';
import { Section } from '@/components/blocks/layout/section';
import { HeroBlock } from '@/components/blocks/display/hero-block';
import { StatBlock } from '@/components/blocks/display/stat-block';
import { ProjectList } from '@/components/projects/project-list';
import type { ProjectSummary } from '@/components/projects/types';
import { useExplore } from '@/src/hooks/useExplore';
import { formatEth, getDaysLeft, getProgress } from '@/lib/format';
import { PROJECT_STATUS_STYLES, PROJECT_STATUS_LABELS, PLATFORM_STATS } from '@/lib/constants';

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
  { key: 'latest', label: 'Newest' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'progress', label: 'Progress' },
] as const;

type SortKey = (typeof sortTabs)[number]['key'];

export default function HomePage() {
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const { projects, isLoading, isError, hasMore, loadMore, source } = useExplore();

  const sortedProjects = useMemo(() => {
    if (projects.length === 0) {
      return projects;
    }
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
            <div className="flex overflow-hidden rounded-full bg-slate-100 p-1">
              {sortTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSortKey(tab.key)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition sm:px-4 sm:text-sm ${sortKey === tab.key ? 'bg-white shadow-sm' : 'text-slate-500'}`}
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
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700">
            Worker is temporarily unavailable, trying to fallback directly to chain. Please refresh later.
          </div>
        )}

        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-[28px] bg-slate-200/60" />
            ))}
          </div>
        ) : (
          <ProjectList projects={remainingProjects} />
        )}

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
            <p className="text-xs text-slate-400">
              Data source: {source === 'edge' ? 'Edge Cache' : 'Chain Fallback'}
            </p>
          </div>
        )}
      </Section>
    </PageShell>
  );
}

// Featured Campaign - Custom design, not reusing ProjectCard
function FeaturedCampaign({ project }: { project: ProjectSummary }) {
  const progress = getProgress(project.pledgedAmount, project.goalAmount);
  const daysLeft = getDaysLeft(project.deadline);
  const hasReachedGoal = project.goalAmount > 0 && project.pledgedAmount >= project.goalAmount;
  const derivedStatus = project.status === 'active' && hasReachedGoal ? 'successful' : project.status;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5 transition hover:shadow-2xl hover:shadow-slate-900/10"
    >
      <div className="grid gap-0 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-full">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <AppBadge className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-sm">
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
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Featured
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {project.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm text-slate-600 sm:text-base">
              {project.summary}
            </p>
            <p className="mt-4 text-sm text-slate-500">
              by <span className="font-medium text-slate-700">{project.creator}</span>
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {formatEth(project.pledgedAmount)}
                </p>
                <p className="text-sm text-slate-500">
                  of {formatEth(project.goalAmount)} goal
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{daysLeft}</p>
                <p className="text-sm text-slate-500">days left</p>
              </div>
            </div>

            <AppButton className="w-full rounded-full" size="lg">
              View Campaign
            </AppButton>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Step Card for "How it works"
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
    <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
