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
      title: "Settings",
      url: "#", // Main group doesn't need an icon here if it's just a title
      items: [
        {
          title: "Account",
          url: "/settings/account",
          icon: User,
          isActive: true, // Set account as active initially
        },
        {
          title: "Authorization Center",
          url: "/settings/authorization",
          icon: ShieldCheck,
        },
        {
          title: "Order Settings",
          url: "/settings/orders",
          icon: ShoppingCart,
        },
        {
          title: "Print Settings",
          url: "/settings/print",
          icon: Printer,
        },
        {
          title: "Shipping Settings",
          url: "/settings/shipping",
          icon: Truck,
        },
        {
          title: "Inventory Settings",
          url: "/settings/inventory",
          icon: Archive,
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
            <SidebarMenuButton size="lg" asChild>
              <a href="/settings/account"> {/* Link to default settings page */}
                {/* You might want a specific icon or logo here */}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Settings</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Pass only the main navigation items for settings and the current pathname */}
        <NavMain items={settingsNav.navMain[0].items ?? []} isSettings pathname={pathname} />
        <NavSecondary items={settingsNav.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}