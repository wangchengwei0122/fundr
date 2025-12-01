'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MenuIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Discover' },
  { href: '/create', label: 'Create' },
  { href: '/account', label: 'Account' },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
            <span className="text-lg font-semibold">F</span>
          </span>
          <span className="text-lg font-semibold text-slate-900">Fundr</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-slate-900 ${isActive ? 'text-slate-900' : ''}`}
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
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Mobile menu */}
          <div className="fixed inset-x-0 top-[73px] z-50 md:hidden">
            <div className="mx-4 mt-2 rounded-2xl border border-slate-200/80 bg-white shadow-xl">
              <nav className="flex flex-col gap-1 p-2">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg px-4 py-3 text-base font-medium transition ${
                        isActive
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
    </header>
  );
}
