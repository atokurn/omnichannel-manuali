"use client"

import * as React from "react"
import { usePathname } from 'next/navigation'; // Import usePathname

import { SiteHeader } from "@/components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface ProductsLayoutProps {
  children: React.ReactNode
}

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  const pathname = usePathname();
  const isAddProductPage = pathname === '/products/management/add';

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen">
      <SidebarProvider className="flex flex-col">
        {!isAddProductPage && <SiteHeader />}
        <div className="flex flex-1">
          {!isAddProductPage && <AppSidebar/>}
          {isAddProductPage ? (
            <main className="flex w-full flex-col">
              {children}
            </main>
          ) : (
            <SidebarInset>
              <main className="flex w-full flex-col overflow-hidden py-6">
                {children}
              </main>
            </SidebarInset>
          )}
        </div>
      </SidebarProvider>
    </div>
  )
}