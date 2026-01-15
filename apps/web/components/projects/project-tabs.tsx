'use client';

import { useState } from 'react';
import type { Address } from 'viem';
import { cn } from '@/lib/utils';
import { formatEth, getProgress, getDaysLeft } from '@/lib/format';
import { useBackers } from '@/src/hooks/useBackers';
import type { ProjectDetail } from './types';

type TabType = 'intro' | 'updates' | 'backers';

export type ProjectTabsProps = {
  project: ProjectDetail;
};

export function ProjectTabs({ project }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('intro');
  const campaignAddress = project.id as Address;

  const progress = getProgress(project.pledgedAmount, project.goalAmount);
  const daysLeft = getDaysLeft(project.deadline);
  const hasReachedGoal = project.goalAmount > 0 && project.pledgedAmount >= project.goalAmount;
  const derivedStatus = project.status === 'active' && hasReachedGoal ? 'successful' : project.status;

  const { data: backers = [], isLoading: isLoadingBackers } = useBackers(campaignAddress);

  return (
    <div className="w-full rounded-[28px] bg-white p-4 shadow-lg shadow-blue-950/5 ring-1 ring-slate-900/5 sm:p-6 lg:p-8">
      <nav className="flex w-full flex-wrap gap-3 text-xs font-medium sm:gap-6 sm:text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('intro')}
          className={cn(
            'transition hover:text-slate-900',
            activeTab === 'intro' ? 'text-slate-900' : 'text-slate-500'
          )}
        >
          Project Introduction
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('updates')}
          className={cn(
            'transition hover:text-slate-900',
            activeTab === 'updates' ? 'text-slate-900' : 'text-slate-500'
          )}
        >
          Progress Updates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('backers')}
          className={cn(
            'transition hover:text-slate-900',
            activeTab === 'backers' ? 'text-slate-900' : 'text-slate-500'
          )}
        >
          Backers
        </button>
      </nav>

      <div className="mt-4 sm:mt-6">
        {activeTab === 'intro' && (
          <div className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-600 sm:text-base">
            {project.description}
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 sm:p-6">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                Funding Progress
              </h3>
              <div className="mt-3 space-y-2 text-xs sm:mt-4 sm:space-y-3 sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Current Progress</span>
                  <span className="font-semibold text-slate-900">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Pledged Amount</span>
                  <span className="font-semibold text-slate-900">
                    {formatEth(project.pledgedAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Goal Amount</span>
                  <span className="font-semibold text-slate-900">
                    {formatEth(project.goalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Remaining Amount</span>
                  <span className="font-semibold text-slate-900">
                    {formatEth(Math.max(0, project.goalAmount - project.pledgedAmount))}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 sm:p-6">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Timeline</h3>
              <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                <div className="text-xs text-slate-600 sm:text-sm">
                  <p className="font-medium text-slate-900">Campaign Status</p>
                  <p className="mt-1">
                    {derivedStatus === 'active' && daysLeft > 0
                      ? `Active - ${daysLeft} days remaining`
                      : derivedStatus === 'active' && daysLeft === 0
                        ? 'Deadline reached, awaiting finalization'
                        : derivedStatus === 'successful'
                          ? 'Campaign successfully reached its goal!'
                          : derivedStatus === 'failed'
                            ? 'Campaign did not reach its goal'
                            : 'Campaign has been cancelled'}
                  </p>
                </div>
                {backers.length > 0 && (
                  <div className="text-xs text-slate-600 sm:text-sm">
                    <p className="font-medium text-slate-900">Latest Activity</p>
                    <p className="mt-1">
                      {backers.length} backer{backers.length !== 1 ? 's' : ''} have supported
                      this project
                    </p>
                  </div>
                )}
              </div>
            </div>

            {backers.length === 0 && !isLoadingBackers && (
              <p className="text-center text-xs text-slate-400 sm:text-sm">
                No activity yet. Be the first to support this project!
              </p>
            )}
          </div>
        )}

        {activeTab === 'backers' && (
          <div className="space-y-3 sm:space-y-4">
            {isLoadingBackers ? (
              <div className="py-6 text-center text-xs text-slate-500 sm:py-8 sm:text-sm">
                Loading backers...
              </div>
            ) : backers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 sm:py-8 sm:text-sm">
                No backers yet. Be the first to support this project!
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs text-slate-600 sm:text-sm">
                  Total Backers:{' '}
                  <span className="font-semibold text-slate-900">{backers.length}</span>
                </p>
                <div className="space-y-2 divide-y divide-slate-200">
                  {backers.map((backer, index) => (
                    <div key={`${backer.txHash}-${index}`} className="py-2 first:pt-0 sm:py-3">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900 sm:text-base">
                            {backer.address.slice(0, 6)}...{backer.address.slice(-4)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(backer.timestamp * 1000).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {formatEth(Number(backer.amount))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
