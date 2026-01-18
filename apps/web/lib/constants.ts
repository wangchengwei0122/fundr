import type { ProjectStatus } from '@/components/projects/types';

/**
 * Project status configuration with labels and styling
 */
export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  {
    label: string;
    bgClass: string;
    textClass: string;
  }
> = {
  active: {
    label: 'In Progress',
    bgClass: 'bg-status-active-bg',
    textClass: 'text-status-active-text',
  },
  successful: {
    label: 'Successful',
    bgClass: 'bg-status-successful-bg',
    textClass: 'text-status-successful-text',
  },
  failed: {
    label: 'Not Achieved',
    bgClass: 'bg-status-failed-bg',
    textClass: 'text-status-failed-text',
  },
  cancelled: {
    label: 'Cancelled',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
  },
};

/**
 * Fallback status config using standard Tailwind classes (for backward compatibility)
 */
export const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  active: 'bg-status-active-bg text-status-active-text',
  successful: 'bg-status-successful-bg text-status-successful-text',
  failed: 'bg-status-failed-bg text-status-failed-text',
  cancelled: 'bg-muted text-muted-foreground',
};

/**
 * Status labels
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'In Progress',
  successful: 'Successful',
  failed: 'Not Achieved',
  cancelled: 'Cancelled',
};

/**
 * Preset support amounts in ETH
 */
export const PRESET_SUPPORT_AMOUNTS = [0.05, 0.1, 0.5, 1] as const;

/**
 * Project categories
 */
export const PROJECT_CATEGORIES = [
  'Technology',
  'Art',
  'Education',
  'Environment',
  'Social Impact',
  'Lifestyle',
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/**
 * Create page steps configuration
 */
export const CREATE_STEPS = [
  { id: 'basics', label: 'Basics', description: 'Project title and description' },
  { id: 'funding', label: 'Funding', description: 'Goal and deadline' },
  { id: 'review', label: 'Review', description: 'Review and submit' },
] as const;

/**
 * Platform statistics (placeholder - should be fetched from chain)
 */
export const PLATFORM_STATS = {
  totalRaised: '1,234 ETH',
  totalRaisedUsd: '~$2.5M',
  campaignsCount: 156,
  activeCampaigns: 42,
  backersCount: 8901,
  successRate: 78,
} as const;

/**
 * Maximum values for form validation
 */
export const FORM_LIMITS = {
  titleMaxLength: 100,
  taglineMaxLength: 200,
  descriptionMaxLength: 5000,
  minGoalEth: 0.01,
  maxGoalEth: 10000,
} as const;
