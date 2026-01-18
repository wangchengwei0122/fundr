'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ProjectSummary } from '@/components/projects/types';
import type { EdgeCampaign } from '@/src/lib/edge';
import { fetchCampaignPage } from '@/src/lib/edge';
// [PERF] Removed patchCampaignsRealtime - Edge/API data is fresh enough (Indexer syncs every 30s)
// import { patchCampaignsRealtime } from '@/src/lib/realtime';

const DEFAULT_LIMIT = 12;
const WEI_PER_ETH = 1_000_000_000_000_000_000n;

const FALLBACK_METADATA = {
  title: 'Untitled Project',
  summary: 'Project description is temporarily unavailable. Please try again later.',
  imageUrl:
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  category: 'Unclassified',
};

type NormalisedMetadata = {
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
};

type UseExploreState = {
  projects: ProjectSummary[];
  cursor: number;
  nextCursor: number | null;
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
  source: 'edge' | 'fallback';
};

type UseExploreReturn = UseExploreState & {
  loadMore: () => void;
  reload: () => void;
};

const statusMap: Record<number, ProjectSummary['status']> = {
  0: 'active',
  1: 'successful',
  2: 'failed',
  3: 'cancelled',
};

const metadataCache = new Map<string, NormalisedMetadata>();

function resolveMetadataUrl(uri: string) {
  if (!uri) return null;
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.slice('ipfs://'.length)}`;
  }
  return uri;
}

async function fetchMetadata(uri: string): Promise<NormalisedMetadata> {
  if (metadataCache.has(uri)) {
    return metadataCache.get(uri)!;
  }

  const url = resolveMetadataUrl(uri);
  if (!url) {
    metadataCache.set(uri, FALLBACK_METADATA);
    return FALLBACK_METADATA;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(url, {
      cache: 'force-cache', // IPFS metadata is immutable, use cache
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // For 500 errors or other errors, use fallback directly without throwing exception
      if (response.status >= 500) {
        metadataCache.set(uri, FALLBACK_METADATA);
        return FALLBACK_METADATA;
      }
      throw new Error(`Metadata fetch failed: ${response.status}`);
    }
    const raw = (await response.json()) as Record<string, unknown>;
    const normalised: NormalisedMetadata = {
      title:
        typeof raw.title === 'string' && raw.title.trim().length > 0
          ? (raw.title as string)
          : FALLBACK_METADATA.title,
      summary:
        typeof raw.summary === 'string' && raw.summary.trim().length > 0
          ? (raw.summary as string)
          : typeof raw.description === 'string' && raw.description.trim().length > 0
            ? (raw.description as string)
            : FALLBACK_METADATA.summary,
      imageUrl:
        typeof raw.image === 'string' && raw.image.trim().length > 0
          ? (raw.image as string)
          : typeof raw.cover === 'string' && raw.cover.trim().length > 0
            ? (raw.cover as string)
            : FALLBACK_METADATA.imageUrl,
      category:
        typeof raw.category === 'string' && raw.category.trim().length > 0
          ? (raw.category as string)
          : FALLBACK_METADATA.category,
    };

    metadataCache.set(uri, normalised);
    return normalised;
  } catch (error) {
    // For network errors, timeouts, or parsing errors, silently use fallback
    // Only log in development environment or for unexpected errors
    if (error instanceof Error && !error.name.includes('Abort')) {
      // Ignore timeout errors, log other errors in development environment
      if (process.env.NODE_ENV === 'development') {
        console.debug('Metadata fetch fallback', uri, error.message);
      }
    }
    metadataCache.set(uri, FALLBACK_METADATA);
    return FALLBACK_METADATA;
  }
}

function toEth(value: string) {
  try {
    const wei = BigInt(value);
    const whole = Number(wei / WEI_PER_ETH);
    const fraction = Number(wei % WEI_PER_ETH) / 1e18;
    return whole + fraction;
  } catch {
    return 0;
  }
}

function computeProgress(goal: string, pledged: string) {
  try {
    const goalWei = BigInt(goal);
    if (goalWei === 0n) return 0;
    const pledgedWei = BigInt(pledged);
    const ratio = Number((pledgedWei * 10000n) / goalWei) / 10000;
    return Math.max(0, Math.min(1, ratio));
  } catch {
    return 0;
  }
}

/**
 * Extract metadata from campaign - prefer API-provided metadata, fallback to IPFS
 */
function extractMetadataFromCampaign(campaign: EdgeCampaign): NormalisedMetadata | null {
  const meta = campaign.metadata;
  if (!meta || !meta.title) {
    return null; // No pre-fetched metadata, will need IPFS fallback
  }

  return {
    title: meta.title || FALLBACK_METADATA.title,
    summary: meta.summary || meta.description || FALLBACK_METADATA.summary,
    imageUrl: meta.imageUrl || meta.image || meta.cover || FALLBACK_METADATA.imageUrl,
    category: meta.category || FALLBACK_METADATA.category,
  };
}

async function mapCampaignToSummary(campaign: EdgeCampaign): Promise<ProjectSummary> {
  // [PERF] Prefer API-provided metadata to avoid IPFS requests
  const apiMetadata = extractMetadataFromCampaign(campaign);
  const metadata = apiMetadata ?? (await fetchMetadata(campaign.metadataURI));

  const pledgedAmount = toEth(campaign.totalPledged);
  const goalAmount = toEth(campaign.goal);
  const status = statusMap[campaign.status] ?? 'active';
  const deadlineIso = new Date(campaign.deadline * 1000).toISOString();

  return {
    id: campaign.address,
    title: metadata.title,
    summary: metadata.summary,
    goalAmount,
    pledgedAmount,
    deadline: deadlineIso,
    status,
    creator: campaign.creator,
    category: metadata.category,
    imageUrl: metadata.imageUrl,
    progress: computeProgress(campaign.goal, campaign.totalPledged),
    raw: campaign,
  };
}

const initialState: UseExploreState = {
  projects: [],
  cursor: 0,
  nextCursor: null,
  hasMore: true,
  isLoading: false,
  isError: false,
  source: 'edge',
};

export function useExplore(limit = DEFAULT_LIMIT): UseExploreReturn {
  const [state, setState] = useState<UseExploreState>(initialState);

  const loadPage = useCallback(
    async (cursor: number, replace: boolean) => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));
      try {
        const page = await fetchCampaignPage({ cursor, limit });
        // [PERF] Use Edge/API data directly without additional chain reads
        // Indexer keeps data fresh (30s sync interval), realtime patch is unnecessary
        const projects = await Promise.all(
          page.campaigns.map((campaign) => mapCampaignToSummary(campaign))
        );

        setState((prev) => ({
          projects: replace ? projects : [...prev.projects, ...projects],
          cursor: page.cursor,
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
          isLoading: false,
          isError: false,
          source: page.source,
        }));
      } catch (error) {
        console.error('Failed to load campaigns', error);
        setState((prev) => ({ ...prev, isLoading: false, isError: true }));
      }
    },
    [limit]
  );

  useEffect(() => {
    loadPage(0, true);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (state.isLoading || !state.hasMore || state.nextCursor === null) {
      return;
    }
    loadPage(state.nextCursor, false);
  }, [state.isLoading, state.hasMore, state.nextCursor, loadPage]);

  const reload = useCallback(() => {
    loadPage(0, true);
  }, [loadPage]);

  return {
    ...state,
    loadMore,
    reload,
  };
}
