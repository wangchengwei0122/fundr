/**
 * =============================================================================
 * AppDialog - Fundr Design System Dialog
 * =============================================================================
 *
 * Purpose:
 * Wraps shadcn/ui Dialog with Fundr design tokens, adding:
 * - Glass/elevated variants for content
 * - Size presets (sm, md, lg, xl, full)
 * - Consistent border radius (rounded-2xl)
 * - Shadow-float token for floating appearance
 * - Proper animations via tw-animate-css
 *
 * Replacement Rule:
 * import { Dialog, DialogContent, ... } from '@/components/ui/dialog'
 * -> import { AppDialog, AppDialogContent, ... } from '@/components/app'
 *
 * DO NOT import from @/components/ui/dialog in pages or business components.
 * =============================================================================
 */

'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// =============================================================================
// AppDialog - Root
// =============================================================================

const AppDialog = DialogPrimitive.Root;

// =============================================================================
// AppDialogTrigger
// =============================================================================

const AppDialogTrigger = DialogPrimitive.Trigger;

// =============================================================================
// AppDialogPortal
// =============================================================================

const AppDialogPortal = DialogPrimitive.Portal;

// =============================================================================
// AppDialogClose
// =============================================================================

const AppDialogClose = DialogPrimitive.Close;

// =============================================================================
// AppDialogOverlay
// =============================================================================

const AppDialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="app-dialog-overlay"
    className={cn(
      'fixed inset-0 z-50',
      'bg-black/60 backdrop-blur-sm',
      // Animation
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));

AppDialogOverlay.displayName = 'AppDialogOverlay';

// =============================================================================
// AppDialogContent
// =============================================================================

const dialogContentVariants = cva(
  // Base styles
  [
    'fixed top-[50%] left-[50%] z-50',
    'translate-x-[-50%] translate-y-[-50%]',
    'grid w-full gap-4 p-6',
    'rounded-2xl border',
    // Animation
    'duration-200',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
  ],
  {
    variants: {
      variant: {
        // Default - solid background with float shadow
        default: [
          'bg-card border-border',
          'shadow-[var(--shadow-float-value)]',
        ],
        // Glass - semi-transparent with blur
        glass: [
          'bg-card/80 dark:bg-card/70 border-border/50',
          'backdrop-blur-xl',
          'shadow-[var(--shadow-float-value)]',
        ],
        // Elevated - prominent shadow for important dialogs
        elevated: [
          'bg-card border-border/30',
          'shadow-[var(--shadow-glow-lg-value)]',
        ],
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface AppDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  /**
   * Show the close button in the top-right corner
   */
  showClose?: boolean;
  /**
   * Custom overlay className
   */
  overlayClassName?: string;
}

const AppDialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  AppDialogContentProps
>(
  (
    {
      className,
      children,
      variant,
      size,
      showClose = true,
      overlayClassName,
      ...props
    },
    ref
  ) => (
    <AppDialogPortal>
      <AppDialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="app-dialog-content"
        className={cn(
          dialogContentVariants({ variant, size }),
          // Mobile responsiveness
          'max-w-[calc(100%-2rem)]',
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            data-slot="app-dialog-close"
            className={cn(
              'absolute top-4 right-4',
              'rounded-lg p-1.5',
              'text-muted-foreground hover:text-foreground',
              'opacity-70 hover:opacity-100',
              'transition-all duration-[var(--duration-fast)]',
              'hover:bg-accent',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:pointer-events-none',
              '[&_svg]:size-4 [&_svg]:shrink-0'
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </AppDialogPortal>
  )
);

AppDialogContent.displayName = 'AppDialogContent';

// =============================================================================
// AppDialogHeader
// =============================================================================

const AppDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="app-dialog-header"
    className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
    {...props}
  />
));

AppDialogHeader.displayName = 'AppDialogHeader';

// =============================================================================
// AppDialogFooter
// =============================================================================

const AppDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="app-dialog-footer"
    className={cn(
      'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
      className
    )}
    {...props}
  />
));

AppDialogFooter.displayName = 'AppDialogFooter';

// =============================================================================
// AppDialogTitle
// =============================================================================

const AppDialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="app-dialog-title"
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));

AppDialogTitle.displayName = 'AppDialogTitle';

// =============================================================================
// AppDialogDescription
// =============================================================================

const AppDialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="app-dialog-description"
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
));

AppDialogDescription.displayName = 'AppDialogDescription';

// =============================================================================
// Exports
// =============================================================================

export {
  AppDialog,
  AppDialogPortal,
  AppDialogOverlay,
  AppDialogClose,
  AppDialogTrigger,
  AppDialogContent,
  AppDialogHeader,
  AppDialogFooter,
  AppDialogTitle,
  AppDialogDescription,
  dialogContentVariants,
};
