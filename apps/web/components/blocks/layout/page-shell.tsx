import { cn } from '@/lib/utils';

export type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Maximum width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Vertical padding size */
  paddingY?: 'sm' | 'md' | 'lg';
};

const maxWidthMap = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  full: 'max-w-full',
};

const paddingYMap = {
  sm: 'py-4 sm:py-6',
  md: 'py-6 sm:py-10',
  lg: 'py-8 sm:py-12',
};

export function PageShell({
  children,
  className,
  maxWidth = 'xl',
  paddingY = 'md',
}: PageShellProps) {
  return (
    <main
      className={cn(
        'mx-auto w-full px-4 sm:px-6',
        maxWidthMap[maxWidth],
        paddingYMap[paddingY],
        className
      )}
    >
      {children}
    </main>
  );
}
