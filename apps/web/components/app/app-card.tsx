/**
 * =============================================================================
 * AppCard - Fundr Design System Card
 * =============================================================================
 *
 * Purpose:
 * Wraps shadcn/ui Card family with Fundr design tokens, adding:
 * - Consistent rounded corners (rounded-2xl = 24px)
 * - Shadow tokens (shadow-card) instead of arbitrary shadows
 * - Variant support: default, glass, elevated
 * - Interactive mode with hover effects and glow
 *
 * Replacement Rule:
 * import { Card, CardHeader, ... } from '@/components/ui/card'
 * -> import { AppCard, AppCardHeader, ... } from '@/components/app'
 *
 * DO NOT import from @/components/ui/card in pages or business components.
 * =============================================================================
 */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// =============================================================================
// AppCard - Main card container
// =============================================================================

const appCardVariants = cva(
  // Base styles - consistent radius and structure
  [
    'flex flex-col gap-6 rounded-2xl py-6',
    'text-card-foreground',
    'transition-all duration-[var(--duration-base)] ease-out',
  ],
  {
    variants: {
      variant: {
        // Default - solid card with subtle shadow
        default: [
          'bg-card border border-border',
          'shadow-[var(--shadow-card-value)]',
        ],
        // Glass - semi-transparent with blur
        glass: [
          'bg-card/70 dark:bg-card/50 border border-border/50',
          'backdrop-blur-md',
          'shadow-[var(--shadow-card-value)]',
        ],
        // Elevated - more prominent shadow for featured content
        elevated: [
          'bg-card border border-border/50',
          'shadow-[var(--shadow-float-value)]',
        ],
        // Ghost - no background or shadow
        ghost: [
          'bg-transparent border-none shadow-none',
        ],
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:shadow-[var(--shadow-float-value)]',
          'hover:border-border/80',
          'hover:-translate-y-0.5',
          'active:translate-y-0 active:scale-[0.99]',
        ],
        false: '',
      },
      glow: {
        none: '',
        primary: 'hover:shadow-[var(--shadow-glow-value)]',
        success: 'hover:shadow-[var(--shadow-glow-success-value)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      interactive: false,
      glow: 'none',
    },
    compoundVariants: [
      // Interactive glass cards get slightly more opacity on hover
      {
        variant: 'glass',
        interactive: true,
        className: 'hover:bg-card/85 dark:hover:bg-card/60',
      },
    ],
  }
);

export interface AppCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof appCardVariants> {}

const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  ({ className, variant, interactive, glow, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="app-card"
        className={cn(appCardVariants({ variant, interactive, glow, className }))}
        {...props}
      />
    );
  }
);

AppCard.displayName = 'AppCard';

// =============================================================================
// AppCardHeader
// =============================================================================

export interface AppCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppCardHeader = React.forwardRef<HTMLDivElement, AppCardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="app-card-header"
        className={cn(
          '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6',
          'has-[[data-slot=app-card-action]]:grid-cols-[1fr_auto]',
          '[.border-b]:pb-6',
          className
        )}
        {...props}
      />
    );
  }
);

AppCardHeader.displayName = 'AppCardHeader';

// =============================================================================
// AppCardTitle
// =============================================================================

export interface AppCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

const AppCardTitle = React.forwardRef<HTMLHeadingElement, AppCardTitleProps>(
  ({ className, as: Comp = 'h3', ...props }, ref) => {
    return (
      <Comp
        ref={ref as React.Ref<HTMLHeadingElement>}
        data-slot="app-card-title"
        className={cn(
          'text-lg font-semibold leading-tight tracking-tight',
          className
        )}
        {...props}
      />
    );
  }
);

AppCardTitle.displayName = 'AppCardTitle';

// =============================================================================
// AppCardDescription
// =============================================================================

export interface AppCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AppCardDescription = React.forwardRef<HTMLParagraphElement, AppCardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        data-slot="app-card-description"
        className={cn('text-sm text-muted-foreground leading-relaxed', className)}
        {...props}
      />
    );
  }
);

AppCardDescription.displayName = 'AppCardDescription';

// =============================================================================
// AppCardAction - For buttons/actions in header
// =============================================================================

export interface AppCardActionProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppCardAction = React.forwardRef<HTMLDivElement, AppCardActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="app-card-action"
        className={cn(
          'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
          className
        )}
        {...props}
      />
    );
  }
);

AppCardAction.displayName = 'AppCardAction';

// =============================================================================
// AppCardContent
// =============================================================================

export interface AppCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Remove horizontal padding (useful for full-bleed content)
   */
  noPadding?: boolean;
}

const AppCardContent = React.forwardRef<HTMLDivElement, AppCardContentProps>(
  ({ className, noPadding = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="app-card-content"
        className={cn(noPadding ? '' : 'px-6', className)}
        {...props}
      />
    );
  }
);

AppCardContent.displayName = 'AppCardContent';

// =============================================================================
// AppCardFooter
// =============================================================================

export interface AppCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppCardFooter = React.forwardRef<HTMLDivElement, AppCardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="app-card-footer"
        className={cn(
          'flex items-center px-6',
          '[.border-t]:pt-6',
          className
        )}
        {...props}
      />
    );
  }
);

AppCardFooter.displayName = 'AppCardFooter';

// =============================================================================
// Exports
// =============================================================================

export {
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardDescription,
  AppCardAction,
  AppCardContent,
  AppCardFooter,
  appCardVariants,
};
