'use client';

import { usePathname } from 'next/navigation';
import { InventorySidebar } from '@/components/inventory-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Daftar path yang tidak menggunakan layout ini
  const excludedPaths = [
    '/inventory/stock/stock-in/add',
    '/inventory/stock/stock-out/add',
  ];

  // Periksa apakah path saat ini termasuk dalam daftar pengecualian
  const useLayout = !excludedPaths.includes(pathname);

  if (!useLayout) {
    // Jika path dikecualikan, render children saja
    return <>{children}</>;
  }

  // Jika path tidak dikecualikan, render layout lengkap
  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <InventorySidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}