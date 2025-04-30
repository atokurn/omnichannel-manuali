"use client"

import * as React from "react"
import { usePathname } from 'next/navigation'; // Import usePathname

import { SiteHeader } from "@/components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function ProductsLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const pathname = usePathname();
  
    // Daftar path yang tidak menggunakan layout ini
    const excludedPaths = [
      '/products/management/add',
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
            <AppSidebar />
            <SidebarInset>
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  }