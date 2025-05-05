"use client"

import * as React from "react"
import { usePathname } from "next/navigation" // Import usePathname
import {
  User, // Example icon for account
  ShieldCheck, // Example icon for Authorization Center
  ShoppingCart, // Example icon for Order Settings
  Printer, // Example icon for Print Settings
  Truck, // Example icon for Shipping Settings
  Archive, // Example icon for Inventory Settings
  LifeBuoy,
  Send,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const settingsNav = {
  navMain: [
    {
      title: "Account",
      url: "#", // Placeholder URL
      icon: User,
      isActive: true, // Main group doesn't need an icon here if it's just a title
      items: [
        {
          title: "Profile",
          url: "/settings/account",
          icon: User,
          isActive: true, // Set account as active initially
        },
        {
          title: "User Management",
          url: "/settings/account/users",
          icon: ShoppingCart,
        },
        {
          title: "Roles",
          url: "/settings/account/roles",
          icon: Printer,
        },
      ],
    },
        {
        title: "Authorization Center",
        url: "#",
        icon: ShieldCheck,          
        items: [
          {
            title: "Authorization",
            url: "/settings/authorization", // Example URL
            icon: User,
          },
        ],
      },
      {
        title: "Order Settings",
        url: "#", // Placeholder URL
        icon: ShoppingCart,
        items: [
          {
            title: "Buat Anggaran",
            url: "/finance/budget/create", // Example URL
            icon: User,
          },
          {
            title: "Laporan Anggaran",
            url: "/finance/budget/reports", // Example URL
            icon: User,
          },
        ],
      },
      {
        title: "Print Settings",
        url: "#", // Placeholder URL
        icon: Printer,
        items: [
          {
            title: "Buat Anggaran",
            url: "/finance/budget/create", // Example URL
            icon: User,
          },
          {
            title: "Laporan Anggaran",
            url: "/finance/budget/reports", // Example URL
            icon: User,
          },
        ],
      },
      {
        title: "Shipping Settings",
        url: "#", // Placeholder URL
        icon: Truck,
        items: [
          {
            title: "Buat Anggaran",
            url: "/finance/budget/create", // Example URL
            icon: User,
          },
          {
            title: "Laporan Anggaran",
            url: "/finance/budget/reports", // Example URL
            icon: User,
          },
        ],
      },
      {
        title: "Inventory Settings",
        url: "#", // Placeholder URL
        icon: Archive,
        items: [
          {
            title: "Buat Anggaran",
            url: "/finance/budget/create", // Example URL
            icon: User,
          },
          {
            title: "Laporan Anggaran",
            url: "/finance/budget/reports", // Example URL
            icon: User,
          },
        ],
      },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function SettingsSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname() // Get current pathname

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild isActive={pathname === "/settings"}>
              <a href="/settings/account">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <User className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Settings</span>
                  <span className="truncate text-xs">Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Pass only the main navigation items for settings and the current pathname */}
        <NavMain items={settingsNav.navMain} pathname={pathname} />
        <NavSecondary items={settingsNav.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}