import { Suspense } from 'react';
import { HomeClient } from './home-client';
import { fetchProjectsServer } from '@/src/lib/server-fetch';

// =============================================================================
// ISR Configuration
// =============================================================================

// Revalidate every 60 seconds for fresh data with caching benefits
export const revalidate = 60;

// =============================================================================
// Loading Fallback
// =============================================================================

function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero skeleton */}
      <div className="mb-16 h-64 animate-pulse rounded-2xl bg-muted/60" />

      {/* Stats skeleton */}
      <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>

      {/* Featured skeleton */}
      <div className="mb-16 h-96 animate-pulse rounded-2xl bg-muted/60" />

      {/* Projects grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Default Fallback Data
// =============================================================================

const EMPTY_DATA = {
  projects: [],
  cursor: 0,
  nextCursor: null,
  hasMore: false,
  total: 0,
  source: 'edge' as const,
};

// =============================================================================
// Page Component (Server Component)
// =============================================================================

export default async function HomePage() {
  // [PERF] Server-side data fetching with ISR caching
  // This runs on the server and results are cached for 60 seconds
  const initialData = await fetchProjectsServer({ cursor: 0, limit: 12 });

  // Use fetched data or fallback to empty state
  const data = initialData ?? EMPTY_DATA;

  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeClient
        initialProjects={data.projects}
        initialNextCursor={data.nextCursor}
        initialHasMore={data.hasMore}
        initialSource={data.source}
      />
    </Suspense>
  );
}
