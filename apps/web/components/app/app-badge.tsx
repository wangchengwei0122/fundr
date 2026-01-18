/**
 * =============================================================================
 * AppBadge - Fundr Design System Badge
 * =============================================================================
 *
 * Purpose:
 * Wraps shadcn/ui Badge with Fundr design tokens, adding:
 * - Semantic status variants for campaign states
 * - Pill-style (rounded-full) by default
 * - Size options (sm/md)
 * - Proper dark mode contrast
 *
 * Replacement Rule:
 * import { Badge } from '@/components/ui/badge'
 * -> import { AppBadge } from '@/components/app'
 *
 * DO NOT import from @/components/ui/badge in pages or business components.
 * =============================================================================
 */

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const appBadgeVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center whitespace-nowrap font-medium',
    'rounded-full border',
    'transition-colors duration-[var(--duration-fast)]',
    '[&>svg]:size-3 gap-1 [&>svg]:pointer-events-none',
    'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
    'w-fit shrink-0 overflow-hidden',
  ],
  {
    variants: {
      variant: {
        // Default - primary styled
        default: [
          'border-transparent bg-primary text-primary-foreground',
          '[a&]:hover:bg-primary/90',
        ],
        // Secondary - muted appearance
        secondary: [
          'border-transparent bg-secondary text-secondary-foreground',
          '[a&]:hover:bg-secondary/80',
        ],
        // Outline - transparent with border
        outline: [
          'border-border bg-transparent text-foreground',
          '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ],
        // Destructive - for errors/failures
        destructive: [
          'border-transparent bg-destructive text-destructive-foreground',
          '[a&]:hover:bg-destructive/90',
          'focus-visible:ring-destructive/30',
        ],
        // Success - for positive states
        success: [
          'border-transparent bg-success text-success-foreground',
          '[a&]:hover:bg-success/90',
          'focus-visible:ring-success/30',
        ],
        // Warning - for attention states
        warning: [
          'border-transparent bg-warning text-warning-foreground',
          '[a&]:hover:bg-warning/90',
        ],

        // ========== Campaign Status Variants ==========
        // These use semantic status tokens from Fundr design system

        // Active campaign - blue/cyan tint
        'status-active': [
          'border-status-active-foreground/20 bg-status-active text-status-active-foreground',
          '[a&]:hover:bg-status-active/80',
        ],
        // Successful/funded campaign - green tint
        'status-successful': [
          'border-status-successful-foreground/20 bg-status-successful text-status-successful-foreground',
          '[a&]:hover:bg-status-successful/80',
        ],
        // Failed campaign - red tint
        'status-failed': [
          'border-status-failed-foreground/20 bg-status-failed text-status-failed-foreground',
          '[a&]:hover:bg-status-failed/80',
        ],
        // Pending campaign - amber/yellow tint
        'status-pending': [
          'border-status-pending-foreground/20 bg-status-pending text-status-pending-foreground',
          '[a&]:hover:bg-status-pending/80',
        ],

        // ========== Glass Variant ==========
        // Semi-transparent with backdrop blur
        glass: [
          'border-border/50 bg-background/60 text-foreground backdrop-blur-sm',
          '[a&]:hover:bg-background/80',
          'dark:bg-background/40 dark:border-border/30',
        ],
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface AppBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof appBadgeVariants> {
  /**
   * Render as a different element (e.g., for links)
   */
  asChild?: boolean;
}

const AppBadge = React.forwardRef<HTMLSpanElement, AppBadgeProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span';

    return (
      <Comp
        ref={ref}
        data-slot="app-badge"
        className={cn(appBadgeVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

AppBadge.displayName = 'AppBadge';

export { AppBadge, appBadgeVariants };
