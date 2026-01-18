/**
 * =============================================================================
 * AppButton - Fundr Design System Button
 * =============================================================================
 *
 * Purpose:
 * Wraps shadcn/ui Button with Fundr design tokens, adding:
 * - Pill-style rounded corners (default)
 * - Glow effects for Web3 aesthetic
 * - Additional variants: success
 * - Consistent focus rings and hover states
 *
 * Replacement Rule:
 * import { Button } from '@/components/ui/button'
 * -> import { AppButton } from '@/components/app'
 *
 * DO NOT import from @/components/ui/button in pages or business components.
 * =============================================================================
 */

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const appButtonVariants = cva(
  // Base styles - Fundr design system
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'transition-all duration-[var(--duration-base)] ease-out',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0 shrink-0',
    'outline-none',
    // Focus ring - uses Fundr tokens
    'focus-visible:ring-[3px] focus-visible:ring-ring/50',
    // Aria invalid state
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  ],
  {
    variants: {
      variant: {
        // Primary - electric cyan-blue with glow potential
        primary: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'active:scale-[0.98]',
        ],
        // Secondary - subtle blue-gray
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
          'active:scale-[0.98]',
        ],
        // Outline - transparent with border
        outline: [
          'border border-border bg-transparent',
          'hover:bg-accent hover:text-accent-foreground',
          'dark:border-border dark:hover:bg-accent/50',
          'active:scale-[0.98]',
        ],
        // Ghost - no background until hover
        ghost: [
          'bg-transparent',
          'hover:bg-accent hover:text-accent-foreground',
          'dark:hover:bg-accent/50',
        ],
        // Destructive - for dangerous actions
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
          'focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/40',
          'active:scale-[0.98]',
        ],
        // Success - for positive actions (fund, confirm, etc.)
        success: [
          'bg-success text-success-foreground',
          'hover:bg-success/90',
          'focus-visible:ring-success/30',
          'active:scale-[0.98]',
        ],
        // Link - text only with underline
        link: [
          'text-primary underline-offset-4',
          'hover:underline',
          'p-0 h-auto',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-full gap-1.5 has-[>svg]:px-2.5',
        md: 'h-9 px-4 text-sm rounded-full has-[>svg]:px-3',
        lg: 'h-11 px-6 text-base rounded-full has-[>svg]:px-4',
        icon: 'size-9 rounded-full p-0',
      },
      glow: {
        none: '',
        primary: [
          'hover:shadow-[var(--shadow-glow-value)]',
          'focus-visible:shadow-[var(--shadow-glow-value)]',
        ],
        success: [
          'hover:shadow-[var(--shadow-glow-success-value)]',
          'focus-visible:shadow-[var(--shadow-glow-success-value)]',
        ],
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      glow: 'none',
    },
    compoundVariants: [
      // Primary with glow by default on hover (subtle)
      {
        variant: 'primary',
        glow: 'none',
        className: 'hover:shadow-[0_0_20px_oklch(0.58_0.2_250/0.15)]',
      },
      // Success with glow by default
      {
        variant: 'success',
        glow: 'none',
        className: 'hover:shadow-[0_0_20px_oklch(0.65_0.18_155/0.15)]',
      },
    ],
  }
);

export interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appButtonVariants> {
  /**
   * Render as a different element (e.g., for Next.js Link)
   */
  asChild?: boolean;
}

const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant, size, glow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        data-slot="app-button"
        className={cn(appButtonVariants({ variant, size, glow, className }))}
        {...props}
      />
    );
  }
);

AppButton.displayName = 'AppButton';

export { AppButton, appButtonVariants };
