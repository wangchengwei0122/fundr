/**
 * Formatting utilities for the Fundr platform
 */

/**
 * Format ETH value with proper decimals
 */
export function formatEth(
  value: number,
  options?: { decimals?: number; showSymbol?: boolean }
): string {
  const { decimals = 4, showSymbol = true } = options ?? {};

  if (!Number.isFinite(value)) {
    return showSymbol ? '0 ETH' : '0';
  }

  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: value >= 1 ? 0 : 2,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${formatted} ETH` : formatted;
}

/**
 * Format wallet address with ellipsis
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Calculate days left until deadline
 */
export function getDaysLeft(deadline: string | Date | number): number {
  const deadlineTime =
    typeof deadline === 'string'
      ? new Date(deadline).getTime()
      : typeof deadline === 'number'
        ? deadline
        : deadline.getTime();

  const millisLeft = deadlineTime - Date.now();
  return Math.max(0, Math.ceil(millisLeft / (1000 * 60 * 60 * 24)));
}

/**
 * Calculate funding progress percentage (0-1)
 */
export function getProgress(pledged: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(1, Math.max(0, pledged / goal));
}

/**
 * Format date for display
 */
export function formatDate(
  date: string | Date,
  style: 'short' | 'long' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (style === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}
