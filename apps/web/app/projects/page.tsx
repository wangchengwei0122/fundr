'use client';

import { useMemo, useState } from 'react';

import { AppButton } from '@/components/app';
import { ProjectList } from '@/components/projects/project-list';
import { useExplore } from '@/src/hooks/useExplore';

const sortTabs = [
  { key: 'latest', label: 'Newest' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'progress', label: 'Progress' },
] as const;

type SortKey = (typeof sortTabs)[number]['key'];

export default function ProjectsPage() {
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const { projects, isLoading, isError, hasMore, loadMore, source } = useExplore(24); // 显示更多项目

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

  return (
    <main className="mx-auto flex w-full max-w-full flex-col gap-8 overflow-x-hidden px-4 py-4 sm:max-w-6xl sm:gap-12 sm:px-6 sm:py-6">
      <section className="w-full max-w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-full">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              All Projects
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Browse all available crowdfunding projects and discover initiatives that resonate with
              you.
            </p>
          </div>
          <div className="flex w-full max-w-full overflow-x-auto rounded-full bg-muted p-1 sm:w-auto">
            {sortTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSortKey(tab.key)}
                className={`shrink-0 rounded-full px-4 py-1 text-sm font-medium transition-base sm:px-5 sm:text-base ${
                  sortKey === tab.key ? 'bg-card shadow-soft' : 'text-muted-foreground'
                }`}
                disabled={sortKey === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Worker is temporarily unavailable, trying to fallback directly to chain. Please refresh
            later.
          </div>
        )}

        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        ) : (
          <ProjectList projects={sortedProjects} />
        )}

        {projects.length > 0 && (
          <div className="flex w-full max-w-full flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Data source: {source === 'edge' ? 'Edge Cache' : 'Chain Fallback'}
            </p>
            <div className="flex w-full max-w-full items-center justify-center">
              <AppButton
                onClick={loadMore}
                disabled={!hasMore || isLoading}
                variant="outline"
                className="w-full rounded-full px-6 sm:w-auto"
              >
                {hasMore ? (isLoading ? 'Loading...' : 'Load More') : 'No more projects'}
              </AppButton>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

