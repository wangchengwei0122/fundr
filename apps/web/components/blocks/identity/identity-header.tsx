import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatAddress } from '@/lib/format';

export type IdentityHeaderProps = {
  /** Wallet address */
  address: string;
  /** ENS name if available */
  ensName?: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Balance display */
  balance?: {
    value: string;
    symbol: string;
  };
  /** Chain ID indicator */
  chainId?: number;
  /** Action buttons */
  actions?: React.ReactNode;
  className?: string;
};

export function IdentityHeader({
  address,
  ensName,
  avatarUrl,
  balance,
  actions,
  className,
}: IdentityHeaderProps) {
  const displayName = ensName || formatAddress(address);

  // Generate gradient background based on address (pseudo-random)
  const gradientHue = parseInt(address.slice(2, 8), 16) % 360;

  return (
    <section
      className={cn(
        'rounded-2xl bg-card p-6 shadow-card ring-1 ring-border sm:p-8',
        className
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Identity Info */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full sm:h-20 sm:w-20"
            style={{
              background: avatarUrl
                ? undefined
                : `linear-gradient(135deg, hsl(${gradientHue}, 70%, 60%), hsl(${(gradientHue + 60) % 360}, 70%, 50%))`,
            }}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                {address.slice(2, 4).toUpperCase()}
              </div>
            )}
          </div>

          {/* Address & Balance */}
          <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
            <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
              {displayName}
            </h1>
            {balance && (
              <p className="text-sm text-muted-foreground">
                Balance: {balance.value} {balance.symbol}
              </p>
            )}
            <p className="truncate font-mono text-xs text-muted-foreground">{address}</p>
          </div>
        </div>

        {/* Actions */}
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
