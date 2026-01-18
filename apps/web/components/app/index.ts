/**
 * =============================================================================
 * Fundr App Design System - Unified Exports
 * =============================================================================
 *
 * This is the ONLY import point for UI components in pages and business logic.
 *
 * Usage:
 * import { AppButton, AppCard, AppBadge, ... } from '@/components/app';
 *
 * Rules:
 * 1. Pages and business components (app/*, components/projects/*, etc.)
 *    MUST only import from this module.
 * 2. DO NOT import from @/components/ui/* directly.
 * 3. All components here wrap shadcn/ui with Fundr design tokens.
 *
 * =============================================================================
 */

// =============================================================================
// Button
// =============================================================================
export { AppButton, appButtonVariants } from './app-button';
export type { AppButtonProps } from './app-button';

// =============================================================================
// Badge
// =============================================================================
export { AppBadge, appBadgeVariants } from './app-badge';
export type { AppBadgeProps } from './app-badge';

// =============================================================================
// Card
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
} from './app-card';
export type {
  AppCardProps,
  AppCardHeaderProps,
  AppCardTitleProps,
  AppCardDescriptionProps,
  AppCardActionProps,
  AppCardContentProps,
  AppCardFooterProps,
} from './app-card';

// =============================================================================
// Input
// =============================================================================
export { AppInput, AppTextarea, inputWrapperVariants } from './app-input';
export type { AppInputProps, AppTextareaProps } from './app-input';

// =============================================================================
// Dialog
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
} from './app-dialog';
export type { AppDialogContentProps } from './app-dialog';

// =============================================================================
// Navigation Menu
// =============================================================================
export {
  AppNavigationMenu,
  AppNavigationMenuList,
  AppNavigationMenuItem,
  AppNavigationMenuContent,
  AppNavigationMenuTrigger,
  AppNavigationMenuLink,
  AppNavigationMenuIndicator,
  AppNavigationMenuViewport,
  navigationMenuTriggerStyle,
} from './app-navigation-menu';
export type { AppNavigationMenuProps } from './app-navigation-menu';
