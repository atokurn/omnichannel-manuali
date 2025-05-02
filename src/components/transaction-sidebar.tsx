"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  PackagePlus,
  Settings2,
  SquareTerminal,
  ReceiptText, // Icon for Transactions
  FileText, // Icon for Daftar Transaksi
  BarChart3, // Icon for Laporan Transaksi
  Cog, // Icon for Pengaturan Transaksi
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
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Transaksi",
      url: "#",
      icon: ReceiptText,
      isActive: true,
      items: [
        {
          title: "Daftar Transaksi",
          url: "/transaction/list", // Example URL
          icon: FileText,
        },
        {
          title: "Laporan Transaksi",
          url: "/transaction/reports", // Example URL
          icon: BarChart3,
        },
        {
          title: "Pengaturan Transaksi",
          url: "/transaction/settings", // Example URL
          icon: Cog,
        },
      ],
    },
    {
      title: "Pesanan Pembelian",
      url: "#",
      icon: PackagePlus,
      items: [
        {
          title: "Pesanan Pembelian (PO)",
          url: "/transaction/purchaseorder", // Example URL
          icon: FileText,
        },
        {
          title: "Laporan Transaksi",
          url: "/transaction/reports", // Example URL
          icon: BarChart3,
        },
        {
          title: "Pengaturan Transaksi",
          url: "/transaction/settings", // Example URL
          icon: Cog,
        },
      ],
    },
    // Add other main transaction-related menus if needed
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
  projects: [
    // Keep projects consistent or adjust as needed for Transaction context
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function TransactionSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild isActive={pathname === "/transaction"}>
              <a href="/transaction">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} pathname={pathname} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}