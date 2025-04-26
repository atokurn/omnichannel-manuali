"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
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
      title: "Master Produk",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Manajemen Produk",
          url: "/products/management",
        },
        {
          title: "Kategori Produk",
          url: "/products/categories",
        },
        {
          title: "Material Produk",
          url: "/products/materials",
        },
        {
          title: "Supplier",
          url: "/products/suppliers",
        },
        {
          title: "Komposisi Produk",
          url: "#",
        },
      ],
    },
    {
      title: "E-commerce Produk",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Katalog Online",
          url: "#",
        },
        {
          title: "Diskon & Promosi",
          url: "#",
        },
        {
          title: "Ulasan Produk",
          url: "#",
        },
        {
          title: "Stok Online",
          url: "#",
        },
        {
          title: "Harga Produk",
          url: "#",
        },
      ],
    },
    {
      title: "Laporan Produk",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Performa Produk",
          url: "#",
        },
        {
          title: "Stok Produk",
          url: "#",
        },
        {
          title: "Riwayat Harga",
          url: "#",
        },
        {
          title: "Analisis Penjualan",
          url: "#",
        },
      ],
    },
    {
      title: "Pengaturan",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Umum",
          url: "#",
        },
        {
          title: "Integrasi",
          url: "#",
        },
        {
          title: "Notifikasi",
          url: "#",
        },
        {
          title: "Hak Akses",
          url: "#",
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
  projects: [
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  <span className="truncate font-medium">Products</span>
                  <span className="truncate text-xs">Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
