/**
 * Server-side data fetching utilities
 * Used by Server Components for SSR/ISR
 */

import type { EdgeCampaign, CampaignPage } from './edge';

/**
 * Fetch campaigns from Edge API (server-side)
 * This function is safe to use in Server Components
 */
export async function fetchCampaignsServer(options: {
  cursor?: number;
  limit?: number;
  sort?: 'latest' | 'deadline';
} = {}): Promise<CampaignPage | null> {
  const edgeUrl = process.env.NEXT_PUBLIC_EDGE;
  if (!edgeUrl) {
    console.warn('[server-fetch] NEXT_PUBLIC_EDGE not configured');
    return null;
  }

  const { cursor = 0, limit = 12, sort = 'latest' } = options;

  try {
    const url = new URL('/campaigns', edgeUrl);
    url.searchParams.set('cursor', cursor.toString());
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('sort', sort);

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      // ISR: revalidate every 60 seconds
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn(`[server-fetch] Edge request failed: ${response.status}`);
      return null;
    }

    const data = await response.json() as CampaignPage;
    return { ...data, source: 'edge' as const };
  } catch (error) {
    console.warn('[server-fetch] Failed to fetch from Edge:', error);
    return null;
  }
}

/**
 * Type for pre-processed project data (ready for client)
 */
export type ServerProjectSummary = {
  id: string;
  title: string;
  summary: string;
  goalAmount: number;
  pledgedAmount: number;
  deadline: string;
  status: 'active' | 'successful' | 'failed' | 'cancelled';
  creator: string;
  category: string;
  imageUrl: string;
  progress: number;
};

const WEI_PER_ETH = 1_000_000_000_000_000_000n;

const FALLBACK_METADATA = {
  title: 'Untitled Project',
  summary: 'Project description is temporarily unavailable.',
  imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  category: 'Unclassified',
};

const statusMap: Record<number, ServerProjectSummary['status']> = {
  0: 'active',
  1: 'successful',
  2: 'failed',
  3: 'cancelled',
};

function toEth(value: string): number {
  try {
    const wei = BigInt(value);
    const whole = Number(wei / WEI_PER_ETH);
    const fraction = Number(wei % WEI_PER_ETH) / 1e18;
    return whole + fraction;
  } catch {
    return 0;
  }
}

function computeProgress(goal: string, pledged: string): number {
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
 * Transform EdgeCampaign to ServerProjectSummary
 * Uses pre-fetched metadata from API, no IPFS requests
 */
export function transformCampaignToProject(campaign: EdgeCampaign): ServerProjectSummary {
  const meta = campaign.metadata;

  // Use API-provided metadata or fallback
  const title = meta?.title || FALLBACK_METADATA.title;
  const summary = meta?.summary || meta?.description || FALLBACK_METADATA.summary;
  const imageUrl = meta?.imageUrl || meta?.image || meta?.cover || FALLBACK_METADATA.imageUrl;
  const category = meta?.category || FALLBACK_METADATA.category;

  return {
    id: campaign.address,
    title,
    summary,
    goalAmount: toEth(campaign.goal),
    pledgedAmount: toEth(campaign.totalPledged),
    deadline: new Date(campaign.deadline * 1000).toISOString(),
    status: statusMap[campaign.status] ?? 'active',
    creator: campaign.creator,
    category,
    imageUrl,
    progress: computeProgress(campaign.goal, campaign.totalPledged),
  };
}

/**
 * Fetch and transform campaigns for SSR
 */
export async function fetchProjectsServer(options: {
  cursor?: number;
  limit?: number;
  sort?: 'latest' | 'deadline';
} = {}): Promise<{
  projects: ServerProjectSummary[];
  cursor: number;
  nextCursor: number | null;
  hasMore: boolean;
  total: number;
  source: 'edge' | 'fallback';
} | null> {
  const page = await fetchCampaignsServer(options);
  if (!page) return null;

  const projects = page.campaigns.map(transformCampaignToProject);

  return {
    projects,
    cursor: page.cursor,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    total: page.total,
    source: page.source,
  };
}
