"use client"; // Add this line

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import React from "react";
import { usePathname } from 'next/navigation'; // Import usePathname

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get the current path

  // Check if the current path is the add product page
  const isAddProductPage = pathname === '/products/management/add';

  // If it's the add product page, render only the children
  if (isAddProductPage) {
    return <>{children}</>;
  }

  // Otherwise, render the full layout
  return (
    <div className="[--header-height:calc(--spacing(14))]">
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