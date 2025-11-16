'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import { DataProvider } from '@/context/DataContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <SessionProvider>
      <DataProvider>
        {!isLandingPage && <Navigation />}
        {!isLandingPage ? (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        ) : (
          children
        )}
      </DataProvider>
    </SessionProvider>
  );
}

