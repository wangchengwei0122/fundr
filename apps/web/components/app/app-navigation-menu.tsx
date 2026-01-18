/**
 * =============================================================================
 * AppNavigationMenu - Fundr Design System Navigation Menu
 * =============================================================================
 *
 * Purpose:
 * Wraps shadcn/ui NavigationMenu with Fundr design tokens, adding:
 * - Fundr navbar hover/active styles (subtle underline, soft background)
 * - Glass + shadow-float for dropdown panels
 * - Consistent border radius and ring tokens
 * - Preserved keyboard navigation
 *
 * Replacement Rule:
 * import { NavigationMenu, ... } from '@/components/ui/navigation-menu'
 * -> import { AppNavigationMenu, ... } from '@/components/app'
 *
 * DO NOT import from @/components/ui/navigation-menu in pages or business components.
 * =============================================================================
 */

'use client';

import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDownIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// =============================================================================
// AppNavigationMenu - Root
// =============================================================================

export interface AppNavigationMenuProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  /**
   * Whether to render the viewport (dropdown container)
   */
  viewport?: boolean;
}

const AppNavigationMenu = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  AppNavigationMenuProps
>(({ className, children, viewport = true, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    data-slot="app-navigation-menu"
    data-viewport={viewport}
    className={cn(
      'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
      className
    )}
    {...props}
  >
    {children}
    {viewport && <AppNavigationMenuViewport />}
  </NavigationMenuPrimitive.Root>
));

AppNavigationMenu.displayName = 'AppNavigationMenu';

// =============================================================================
// AppNavigationMenuList
// =============================================================================

const AppNavigationMenuList = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    data-slot="app-navigation-menu-list"
    className={cn(
      'group flex flex-1 list-none items-center justify-center gap-1',
      className
    )}
    {...props}
  />
));

AppNavigationMenuList.displayName = 'AppNavigationMenuList';

// =============================================================================
// AppNavigationMenuItem
// =============================================================================

const AppNavigationMenuItem = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Item
    ref={ref}
    data-slot="app-navigation-menu-item"
    className={cn('relative', className)}
    {...props}
  />
));

AppNavigationMenuItem.displayName = 'AppNavigationMenuItem';

// =============================================================================
// Trigger Style - Shared between trigger and link
// =============================================================================

const navigationMenuTriggerStyle = cva([
  'group inline-flex h-9 w-max items-center justify-center',
  'rounded-lg px-4 py-2',
  'text-sm font-medium',
  'bg-transparent',
  'transition-all duration-[var(--duration-base)]',
  // Hover state - subtle background
  'hover:bg-accent hover:text-accent-foreground',
  // Focus state
  'focus:bg-accent focus:text-accent-foreground focus:outline-none',
  'focus-visible:ring-[3px] focus-visible:ring-ring/50',
  // Active/open state
  'data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground',
  // Disabled
  'disabled:pointer-events-none disabled:opacity-50',
]);

// =============================================================================
// AppNavigationMenuTrigger
// =============================================================================

const AppNavigationMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    data-slot="app-navigation-menu-trigger"
    className={cn(navigationMenuTriggerStyle(), 'group', className)}
    {...props}
  >
    {children}
    <ChevronDownIcon
      className={cn(
        'relative top-[1px] ml-1 size-3',
        'transition-transform duration-[var(--duration-slow)]',
        'group-data-[state=open]:rotate-180'
      )}
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));

AppNavigationMenuTrigger.displayName = 'AppNavigationMenuTrigger';

// =============================================================================
// AppNavigationMenuContent
// =============================================================================

const AppNavigationMenuContent = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    data-slot="app-navigation-menu-content"
    className={cn(
      // Animation
      'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out',
      'data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out',
      'data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52',
      'data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52',
      // Position
      'top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto',
      // Non-viewport mode (inline dropdown)
      'group-data-[viewport=false]/navigation-menu:bg-card/90 group-data-[viewport=false]/navigation-menu:backdrop-blur-xl',
      'group-data-[viewport=false]/navigation-menu:text-card-foreground',
      'group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out',
      'group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95',
      'group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0',
      'group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5',
      'group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-xl',
      'group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:border-border/50',
      'group-data-[viewport=false]/navigation-menu:shadow-[var(--shadow-float-value)]',
      'group-data-[viewport=false]/navigation-menu:duration-200',
      // Remove focus ring from nested links
      '**:data-[slot=app-navigation-menu-link]:focus:ring-0 **:data-[slot=app-navigation-menu-link]:focus:outline-none',
      className
    )}
    {...props}
  />
));

AppNavigationMenuContent.displayName = 'AppNavigationMenuContent';

// =============================================================================
// AppNavigationMenuViewport
// =============================================================================

const AppNavigationMenuViewport = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className="absolute top-full left-0 isolate z-50 flex justify-center">
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      data-slot="app-navigation-menu-viewport"
      className={cn(
        'origin-top-center relative mt-1.5',
        'h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden',
        'md:w-[var(--radix-navigation-menu-viewport-width)]',
        // Fundr styling - glass effect
        'bg-card/90 dark:bg-card/80 backdrop-blur-xl',
        'text-card-foreground',
        'rounded-xl border border-border/50',
        'shadow-[var(--shadow-float-value)]',
        // Animation
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90',
        className
      )}
      {...props}
    />
  </div>
));

AppNavigationMenuViewport.displayName = 'AppNavigationMenuViewport';

// =============================================================================
// AppNavigationMenuLink
// =============================================================================

const AppNavigationMenuLink = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Link>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Link
    ref={ref}
    data-slot="app-navigation-menu-link"
    className={cn(
      'flex flex-col gap-1 rounded-lg p-2 text-sm',
      'transition-all duration-[var(--duration-base)]',
      '[&_svg:not([class*="text-"])]:text-muted-foreground',
      '[&_svg:not([class*="size-"])]:size-4',
      // Hover/focus states
      'hover:bg-accent hover:text-accent-foreground',
      'focus:bg-accent focus:text-accent-foreground',
      'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 outline-none',
      // Active state
      'data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground',
      'data-[active=true]:hover:bg-accent data-[active=true]:focus:bg-accent',
      className
    )}
    {...props}
  />
));

AppNavigationMenuLink.displayName = 'AppNavigationMenuLink';

// =============================================================================
// AppNavigationMenuIndicator
// =============================================================================

const AppNavigationMenuIndicator = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    data-slot="app-navigation-menu-indicator"
    className={cn(
      'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden',
      'data-[state=visible]:animate-in data-[state=hidden]:animate-out',
      'data-[state=hidden]:fade-out data-[state=visible]:fade-in',
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));

AppNavigationMenuIndicator.displayName = 'AppNavigationMenuIndicator';

// =============================================================================
// Exports
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
};
