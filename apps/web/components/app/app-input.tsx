/**
 * =============================================================================
 * AppInput - Fundr Design System Input
 * =============================================================================
 *
 * Purpose:
 * Wraps shadcn/ui Input with Fundr design tokens, adding:
 * - Consistent height, padding, and border radius
 * - State variants: default, error, success
 * - Left/right slots for icons or actions
 * - Proper focus rings using design tokens
 *
 * Replacement Rule:
 * import { Input } from '@/components/ui/input'
 * -> import { AppInput } from '@/components/app'
 *
 * DO NOT import from @/components/ui/input in pages or business components.
 * =============================================================================
 */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// =============================================================================
// Input Wrapper (for slots)
// =============================================================================

const inputWrapperVariants = cva(
  [
    'relative flex items-center w-full',
    'rounded-xl border bg-transparent',
    'transition-all duration-[var(--duration-fast)]',
    // Focus-within for wrapper
    'focus-within:ring-[3px] focus-within:ring-ring/50',
    'has-[:disabled]:opacity-50 has-[:disabled]:pointer-events-none',
  ],
  {
    variants: {
      state: {
        default: [
          'border-input',
          'focus-within:border-ring',
          'dark:bg-input/30',
        ],
        error: [
          'border-destructive',
          'focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40',
          'focus-within:border-destructive',
        ],
        success: [
          'border-success/50',
          'focus-within:ring-success/20',
          'focus-within:border-success',
        ],
      },
      size: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'md',
    },
  }
);

// =============================================================================
// Base Input Styles
// =============================================================================

const inputBaseStyles = cn(
  'flex-1 min-w-0 bg-transparent border-none outline-none',
  'placeholder:text-muted-foreground',
  'selection:bg-primary selection:text-primary-foreground',
  'disabled:cursor-not-allowed',
  // File input styling
  'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
  // Remove default focus styles (handled by wrapper)
  'focus:outline-none focus:ring-0',
);

// =============================================================================
// AppInput Component
// =============================================================================

export interface AppInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputWrapperVariants> {
  /**
   * Content to render on the left side of the input (e.g., icon)
   */
  leftSlot?: React.ReactNode;
  /**
   * Content to render on the right side of the input (e.g., icon, button)
   */
  rightSlot?: React.ReactNode;
  /**
   * Additional className for the wrapper element
   */
  wrapperClassName?: string;
}

const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      className,
      type,
      state,
      size,
      leftSlot,
      rightSlot,
      wrapperClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    // If no slots, render simple input
    if (!leftSlot && !rightSlot) {
      return (
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          data-slot="app-input"
          className={cn(
            inputBaseStyles,
            inputWrapperVariants({ state, size }),
            // Padding for simple input
            size === 'sm' ? 'px-3' : size === 'lg' ? 'px-4' : 'px-3.5',
            className
          )}
          {...props}
        />
      );
    }

    // With slots, use wrapper
    return (
      <div
        data-slot="app-input-wrapper"
        className={cn(
          inputWrapperVariants({ state, size }),
          wrapperClassName
        )}
      >
        {leftSlot && (
          <div
            data-slot="app-input-left-slot"
            className={cn(
              'flex items-center justify-center shrink-0 text-muted-foreground',
              '[&>svg]:size-4',
              size === 'sm' ? 'pl-2.5' : size === 'lg' ? 'pl-4' : 'pl-3',
            )}
          >
            {leftSlot}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          data-slot="app-input"
          className={cn(
            inputBaseStyles,
            'h-full',
            // Adjust padding based on slots
            leftSlot
              ? 'pl-2'
              : size === 'sm'
              ? 'pl-3'
              : size === 'lg'
              ? 'pl-4'
              : 'pl-3.5',
            rightSlot
              ? 'pr-2'
              : size === 'sm'
              ? 'pr-3'
              : size === 'lg'
              ? 'pr-4'
              : 'pr-3.5',
            className
          )}
          {...props}
        />
        {rightSlot && (
          <div
            data-slot="app-input-right-slot"
            className={cn(
              'flex items-center justify-center shrink-0 text-muted-foreground',
              '[&>svg]:size-4',
              size === 'sm' ? 'pr-2.5' : size === 'lg' ? 'pr-4' : 'pr-3',
            )}
          >
            {rightSlot}
          </div>
        )}
      </div>
    );
  }
);

AppInput.displayName = 'AppInput';

// =============================================================================
// AppTextarea - Bonus component for multi-line input
// =============================================================================

export interface AppTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<VariantProps<typeof inputWrapperVariants>, 'size'> {}

const AppTextarea = React.forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ className, state, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="app-textarea"
        className={cn(
          'w-full min-h-[80px] rounded-xl border bg-transparent px-3.5 py-3',
          'text-sm placeholder:text-muted-foreground',
          'selection:bg-primary selection:text-primary-foreground',
          'transition-all duration-[var(--duration-fast)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          // State-based styling
          state === 'error'
            ? 'border-destructive focus:ring-destructive/20 dark:focus:ring-destructive/40'
            : state === 'success'
            ? 'border-success/50 focus:ring-success/20'
            : 'border-input focus:border-ring dark:bg-input/30',
          // Focus styles
          'focus:outline-none focus:ring-[3px] focus:ring-ring/50',
          className
        )}
        {...props}
      />
    );
  }
);

AppTextarea.displayName = 'AppTextarea';

// =============================================================================
// Exports
// =============================================================================

export { AppInput, AppTextarea, inputWrapperVariants };
