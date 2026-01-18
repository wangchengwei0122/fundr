'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';

import { AppBadge } from '@/components/app';
import { getDaysLeft } from '@/lib/format';
import { PROJECT_STATUS_STYLES, PROJECT_STATUS_LABELS } from '@/lib/constants';

import type { ProjectDetail } from './types';
import { ProjectFundingStatus } from './project-funding-status';
import { ProjectTabs } from './project-tabs';
import { ProjectSupportForm } from './project-support-form';
import { ProjectMyPledge } from './project-my-pledge';
import { ProjectClaimPanel } from './project-claim-panel';
import { ProjectCreatorInfo } from './project-creator-info';

export type ProjectDetailsProps = {
  project: ProjectDetail;
};

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const { address } = useAccount();
  const daysLeft = getDaysLeft(project.deadline);

  const hasReachedGoal = project.goalAmount > 0 && project.pledgedAmount >= project.goalAmount;
  const derivedStatus = project.status === 'active' && hasReachedGoal ? 'successful' : project.status;

  const isProjectOpen = project.status === 'active' && daysLeft > 0 && !hasReachedGoal;

  const isCreator = useMemo(() => {
    if (!address) return false;
    try {
      return address.toLowerCase() === (project.owner ?? project.creator).toLowerCase();
    } catch {
      return false;
    }
  }, [address, project.owner, project.creator]);

  const isFinalizable = project.status === 'active' && daysLeft === 0 && hasReachedGoal;
  const campaignAddress = project.id as Address;

  return (
    <article className="w-full max-w-full space-y-6 overflow-x-hidden sm:space-y-10">
      {/* Hero Image */}
      <div className="w-full max-w-full overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border">
        <Image
          src={project.imageUrl}
          alt={project.title}
          width={1200}
          height={500}
          className="h-auto max-h-[500px] w-full object-cover"
        />
      </div>

      {/* Main Content Grid */}
      <section className="grid w-full max-w-full gap-4 overflow-x-hidden sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8">
        {/* Left Column - Main Content */}
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
          {/* Project Header */}
          <div className="w-full max-w-full rounded-xl bg-card p-4 shadow-card ring-1 ring-border sm:p-6 lg:p-8">
            <div className="flex w-full max-w-full flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3 sm:text-sm">
              <span className="break-all">Campaign ID: {project.id}</span>
              <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:px-3">
                {project.category}
              </span>
            </div>

            <div className="mt-3 flex w-full max-w-full flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
              <h1 className="break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                {project.title}
              </h1>
              <AppBadge
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold sm:px-3 ${PROJECT_STATUS_STYLES[derivedStatus]}`}
              >
                {PROJECT_STATUS_LABELS[derivedStatus]}
              </AppBadge>
            </div>

            <p className="mt-3 break-words text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              {project.summary}
            </p>

            {/* Funding Status */}
            <div className="mt-6 sm:mt-8">
              <ProjectFundingStatus
                pledgedAmount={project.pledgedAmount}
                goalAmount={project.goalAmount}
                deadline={project.deadline}
                backerCount={project.backerCount}
                status={project.status}
              />
            </div>
          </div>

          {/* Tabs Section */}
          <ProjectTabs project={project} />
        </div>

        {/* Right Column - Sidebar Actions */}
        <aside className="w-full max-w-full space-y-4 sm:space-y-6">
          {/* Creator Claim Panel */}
          {isCreator && isFinalizable && (
            <ProjectClaimPanel campaignAddress={campaignAddress} />
          )}

          {/* Support Form */}
          {project.status === 'active' && (
            <ProjectSupportForm
              campaignAddress={campaignAddress}
              isProjectOpen={isProjectOpen}
            />
          )}

          {/* My Pledge */}
          <ProjectMyPledge
            campaignAddress={campaignAddress}
            status={project.status}
            daysLeft={daysLeft}
            hasReachedGoal={hasReachedGoal}
          />

          {/* Creator Info */}
          <ProjectCreatorInfo
            creator={project.creator}
            owner={project.owner}
            category={project.category}
          />
        </aside>
      </section>
    </article>
  );
}
