"use client"

import * as React from "react"
import {
  BookOpen, // Icon for Laporan
  DollarSign, // Icon for Keuangan/Anggaran
  Settings2, // Icon for Pengaturan
  Command,
  LifeBuoy,
  Send,
  Frame,
  PieChart,
  Map,
  FileText, // General file/report icon
  BarChart3, // Chart icon
  Cog, // Settings icon
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn", // Placeholder user data
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Laporan Keuangan",
      url: "#", // Placeholder URL
      icon: BookOpen,
      isActive: true, // Set active based on current route logic later
      items: [
        {
          title: "Neraca",
          url: "/finance/balance-sheet", // Example URL
          icon: FileText,
        },
        {
          title: "Laba Rugi",
          url: "/finance/profit-loss", // Example URL
          icon: BarChart3,
        },
        {
          title: "Arus Kas",
          url: "/finance/cash-flow", // Example URL
          icon: FileText,
        },
      ],
    },
    {
      title: "Anggaran",
      url: "#", // Placeholder URL
      icon: DollarSign,
      items: [
        {
          title: "Buat Anggaran",
          url: "/finance/budget/create", // Example URL
          icon: FileText,
        },
        {
          title: "Laporan Anggaran",
          url: "/finance/budget/reports", // Example URL
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Pengaturan Keuangan",
      url: "#", // Placeholder URL
      icon: Settings2,
      items: [
        {
          title: "Akun Bank",
          url: "/finance/settings/bank-accounts", // Example URL
          icon: Cog,
        },
        {
          title: "Periode Akuntansi",
          url: "/finance/settings/accounting-periods", // Example URL
          icon: Cog,
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

export function FinanceSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Keuangan</span>
                  <span className="truncate text-xs">Manajemen</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}