'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MenuIcon, XIcon } from 'lucide-react';
import { AppButton } from '@/components/app';

const navItems = [
  { href: '/', label: 'Discover' },
  { href: '/create', label: 'Create' },
  { href: '/account', label: 'Account' },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
              <span className="text-lg font-semibold">F</span>
            </span>
            <span className="text-lg font-semibold text-foreground">Fundr</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-base hover:text-foreground ${isActive ? 'text-foreground' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <ConnectButton accountStatus="address" showBalance={false} chainStatus="icon" />
            </div>
            <div className="sm:hidden">
              <ConnectButton accountStatus="avatar" showBalance={false} chainStatus="icon" />
            </div>
            <AppButton
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </AppButton>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay - only covers content below navbar */}
          <div
            className="fixed inset-x-0 bottom-0 top-[73px] z-30 bg-foreground/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Mobile menu */}
          <div className="fixed inset-x-0 top-[73px] z-40 md:hidden">
            <div className="border border-border/80 bg-card shadow-float">
              <nav className="flex flex-col gap-1 p-2">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg px-4 py-3 text-base font-medium transition-base ${
                        isActive
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
