import { createPublicClient, http, type Address } from 'viem';
import { campaignAbi } from '@/lib/abi';

import type { ProjectDetail } from '@/components/projects/types';

// =============================================================================
// Constants & Types
// =============================================================================

const statusMap: Record<number, ProjectDetail['status']> = {
  0: 'active',
  1: 'successful',
  2: 'failed',
  3: 'cancelled',
};

const FALLBACK_METADATA = {
  title: 'Untitled Project',
  summary: 'The detailed description of the project is not available, please try again later.',
  description: 'No project introduction content.',
  imageUrl:
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
  category: 'Unclassified',
};

type NormalisedMetadata = {
  title: string;
  summary: string;
  description: string;
  imageUrl: string;
  category: string;
};

// Edge API response type (matches Edge Worker output)
type EdgeCampaignDetail = {
  address: string;
  creator: string;
  goal: string;
  deadline: number;
  status: number;
  totalPledged: string;
  metadataURI: string;
  createdAt: number;
  createdBlock: number;
  // Optional: if API returns aggregated metadata
  metadata?: {
    title?: string;
    summary?: string;
    description?: string;
    imageUrl?: string;
    image?: string;
    cover?: string;
    category?: string;
  };
};

const metadataCache = new Map<string, NormalisedMetadata>();
const WEI_PER_ETH = 1_000_000_000_000_000_000n;

// =============================================================================
// Environment Helpers
// =============================================================================

function getEdgeUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_EDGE;
  return url && url.trim().length > 0 ? url.trim() : null;
}

function getRpcUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_RPC_URL;
  return url && url.trim().length > 0 ? url.trim() : null;
}

function getChainId(): number | null {
  const raw = process.env.NEXT_PUBLIC_CHAIN_ID;
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function ensureAddress(value: string | undefined | null): Address | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return trimmed as Address;
  }
  return null;
}

// =============================================================================
// Metadata Helpers
// =============================================================================

function resolveMetadataUrl(uri: string): string | null {
  if (!uri) return null;
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.slice('ipfs://'.length)}`;
  }
  return uri;
}

/**
 * Fetch metadata from IPFS - only used as fallback when Edge doesn't provide metadata
 */
async function fetchMetadataFromIpfs(uri: string): Promise<NormalisedMetadata> {
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
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for fallback

    const response = await fetch(url, {
      cache: 'force-cache', // Use HTTP cache when available
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Metadata fetch failed: ${response.status}`);
    }

    const raw = (await response.json()) as Record<string, unknown>;
    const normalised = normaliseMetadata(raw);
    metadataCache.set(uri, normalised);
    return normalised;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[project-detail] IPFS metadata fallback failed:', uri, error);
    }
    metadataCache.set(uri, FALLBACK_METADATA);
    return FALLBACK_METADATA;
  }
}

/**
 * Normalise raw metadata from any source (Edge API or IPFS)
 */
function normaliseMetadata(raw: Record<string, unknown>): NormalisedMetadata {
  const title =
    typeof raw.title === 'string' && raw.title.trim().length > 0
      ? raw.title
      : FALLBACK_METADATA.title;

  const summary =
    typeof raw.summary === 'string' && raw.summary.trim().length > 0
      ? raw.summary
      : typeof raw.tagline === 'string' && raw.tagline.trim().length > 0
        ? raw.tagline
        : FALLBACK_METADATA.summary;

  const description =
    typeof raw.description === 'string' && raw.description.trim().length > 0
      ? raw.description
      : summary;

  const imageUrl =
    typeof raw.imageUrl === 'string' && raw.imageUrl.trim().length > 0
      ? raw.imageUrl
      : typeof raw.image === 'string' && raw.image.trim().length > 0
        ? raw.image
        : typeof raw.cover === 'string' && raw.cover.trim().length > 0
          ? raw.cover
          : FALLBACK_METADATA.imageUrl;

  const category =
    typeof raw.category === 'string' && raw.category.trim().length > 0
      ? raw.category
      : FALLBACK_METADATA.category;

  return { title, summary, description, imageUrl, category };
}

// =============================================================================
// Data Conversion
// =============================================================================

function toEth(value: bigint | string): number {
  try {
    const wei = typeof value === 'string' ? BigInt(value) : value;
    const whole = Number(wei / WEI_PER_ETH);
    const fraction = Number(wei % WEI_PER_ETH) / 1e18;
    return whole + fraction;
  } catch {
    return 0;
  }
}

function toProjectDetail(
  address: Address,
  campaign: {
    creator: string;
    goal: string | bigint;
    deadline: number | bigint;
    status: number;
    totalPledged: string | bigint;
  },
  metadata: NormalisedMetadata
): ProjectDetail {
  const deadlineSeconds =
    typeof campaign.deadline === 'bigint' ? Number(campaign.deadline) : campaign.deadline;
  const goalAmount = toEth(typeof campaign.goal === 'bigint' ? campaign.goal : BigInt(campaign.goal));
  const pledgedAmount = toEth(
    typeof campaign.totalPledged === 'bigint' ? campaign.totalPledged : BigInt(campaign.totalPledged)
  );

  const status = statusMap[campaign.status] ?? 'active';
  const deadlineIso = Number.isFinite(deadlineSeconds)
    ? new Date(deadlineSeconds * 1000).toISOString()
    : new Date().toISOString();

  return {
    id: address,
    title: metadata.title,
    summary: metadata.summary,
    description: metadata.description,
    goalAmount,
    pledgedAmount,
    deadline: deadlineIso,
    status,
    creator: campaign.creator as Address,
    category: metadata.category,
    imageUrl: metadata.imageUrl,
    owner: campaign.creator as Address,
    backerCount: 0,
  };
}

// =============================================================================
// Data Fetching: Edge/API (Primary)
// =============================================================================

/**
 * Fetch project detail from Edge/API - primary data source
 */
async function fetchFromEdge(address: Address): Promise<ProjectDetail | null> {
  const edgeUrl = getEdgeUrl();
  if (!edgeUrl) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(`${edgeUrl}/campaigns/${address}`, {
      cache: 'no-store', // Always get fresh data for detail page
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Project not found
      }
      throw new Error(`Edge request failed: ${response.status}`);
    }

    const campaign = (await response.json()) as EdgeCampaignDetail;

    // Determine metadata source: prefer API-provided metadata, fallback to IPFS
    let metadata: NormalisedMetadata;
    if (campaign.metadata && campaign.metadata.title) {
      // API already includes metadata - no IPFS request needed
      metadata = normaliseMetadata(campaign.metadata as Record<string, unknown>);
    } else if (campaign.metadataURI) {
      // Fallback: fetch from IPFS (should be rare if Indexer pre-fetches)
      metadata = await fetchMetadataFromIpfs(campaign.metadataURI);
    } else {
      metadata = FALLBACK_METADATA;
    }

    return toProjectDetail(address, campaign, metadata);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[project-detail] Edge fetch failed:', error);
    }
    return null; // Will trigger chain fallback
  }
}

// =============================================================================
// Data Fetching: Chain (Fallback)
// =============================================================================

/**
 * Fetch project detail directly from chain - only used when Edge/API fails
 */
async function fetchFromChain(address: Address): Promise<ProjectDetail | null> {
  const rpcUrl = getRpcUrl();
  const chainId = getChainId();

  if (!rpcUrl || !chainId) {
    console.error('[project-detail] Chain fallback unavailable: missing RPC config');
    return null;
  }

  try {
    const client = createPublicClient({
      chain: {
        id: chainId,
        name: `chain-${chainId}`,
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } },
      },
      transport: http(rpcUrl),
    });

    // Try multicall first, fallback to individual reads
    let summary: readonly [Address, bigint, bigint, number, bigint];
    let metadataURI: string;

    try {
      const [summaryResult, metadataResult] = await client.multicall({
        allowFailure: false,
        contracts: [
          { address, abi: campaignAbi, functionName: 'getSummary' },
          { address, abi: campaignAbi, functionName: 'metadataURI' },
        ],
      });
      summary = summaryResult as readonly [Address, bigint, bigint, number, bigint];
      metadataURI = metadataResult as string;
    } catch {
      console.warn('[project-detail] Multicall failed, using single reads');
      const [summaryResult, metadataResult] = await Promise.all([
        client.readContract({ address, abi: campaignAbi, functionName: 'getSummary' }),
        client.readContract({ address, abi: campaignAbi, functionName: 'metadataURI' }),
      ]);
      summary = summaryResult as readonly [Address, bigint, bigint, number, bigint];
      metadataURI = metadataResult as string;
    }

    const [creator, goal, deadline, statusIndex, totalPledged] = summary;
    const metadata = await fetchMetadataFromIpfs(metadataURI);

    return toProjectDetail(
      address,
      {
        creator,
        goal,
        deadline,
        status: statusIndex,
        totalPledged,
      },
      metadata
    );
  } catch (error) {
    console.error('[project-detail] Chain fallback failed:', error);
    return null;
  }
}

// =============================================================================
// Main Export
// =============================================================================

/**
 * Fetch project detail with Edge/API as primary source, chain as fallback
 *
 * Data flow:
 * 1. Try Edge/API first (fast, cached)
 * 2. If Edge fails, fallback to direct chain read (slow, but reliable)
 */
export async function fetchProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  const address = ensureAddress(projectId);
  if (!address) {
    return null;
  }

  // [PERF] Primary: fetch from Edge/API
  const edgeResult = await fetchFromEdge(address);
  if (edgeResult) {
    return edgeResult;
  }

  // [PERF] Fallback: direct chain read (only when Edge unavailable)
  if (process.env.NODE_ENV === 'development') {
    console.debug('[project-detail] Edge unavailable, falling back to chain');
  }
  return fetchFromChain(address);
}
