"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  ClipboardList,
  Package,
  PackageCheck,
  Warehouse,
  Boxes,
  ListChecks,
  Move,
  Map,
  Building2,
  LayoutGrid,
  AlertTriangle,
  Database,
  Tag,
  Tags,
  FileStack,
  FileText,
  LifeBuoy, // Added for NavSecondary
  Send, // Added for NavSecondary
  type LucideIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
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

// Define the structure for NavMain items
interface NavMainItem {
  title: string;
  icon: LucideIcon;
  url?: string;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    icon?: LucideIcon; // Optional icon for sub-items if needed by NavMain
    isActive?: boolean;
  }[];
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Stock",
      icon: Package, // Using Package as a representative icon for the category
      isActive: true,
      items: [
        {
          title: "Manual Stock-in",
          icon: ArrowDownToLine,
          url: "/inventory/stock/stock-in",
        },
        {
          title: "Manual Stock-out",
          icon: ArrowUpFromLine,
          url: "/inventory/stock/stock-out",
        },
        {
          title: "Receive",
          icon: PackageCheck,
          url: "/inventory/stock/receive",
        },
        {
          title: "Stock Movement record",
          icon: ClipboardList,
          url: "/inventory/stock/movement",
        },
        {
          title: "Area Stock movement record",
          icon: ArrowRightLeft,
          url: "/inventory/stock/area-movement",
        },
      ],
    },
    {
      title: "SKU",
      icon: Tag, // Using Tag as a representative icon
      items: [
        {
          title: "Merchant SKU",
          icon: Tag,
          url: "/inventory/sku/merchant",
        },
        {
          title: "Merchant Category",
          icon: Tags,
          url: "/inventory/sku/category",
        },
      ],
    },
    {
      title: "SKU Mapping",
      icon: FileText, // Using FileText as a representative icon
      items: [
        {
          title: "By Product",
          icon: Package,
          url: "/inventory/sku-mapping/by-product",
        },
        {
          title: "By Merchant SKU",
          icon: FileText,
          url: "/inventory/sku-mapping/by-merchant",
        },
      ],
    },
    {
      title: "Warehouse",
      icon: Warehouse, // Using Warehouse as a representative icon
      items: [
        {
          title: "Inventory List",
          icon: FileStack,
          url: "/inventory/warehouse/list",
        },
        {
          title: "Inventory Details",
          icon: Database,
          url: "/inventory/warehouse/details",
        },
        {
          title: "Transfer",
          icon: ArrowRightLeft,
          url: "/inventory/warehouse/transfer",
        },
        {
          title: "Stock Count",
          icon: ListChecks,
          url: "/inventory/warehouse/count",
        },
        {
          title: "Move",
          icon: Move,
          url: "/inventory/warehouse/move",
        },
        {
          title: "Area",
          icon: Map,
          url: "/inventory/warehouse/areas",
        },
        {
          title: "Warehouses",
          icon: Building2,
          url: "/inventory/warehouse/warehouses",
        },
        {
          title: "Shelves",
          icon: LayoutGrid,
          url: "/inventory/warehouse/shelves",
        },
      ],
    },
    {
      title: "Inventory Restock",
      icon: Boxes, // Using Boxes as a representative icon
      items: [
        {
          title: "Restock Storage",
          icon: Boxes,
          url: "/inventory/restock/storage",
        },
        {
          title: "Restock warning",
          icon: AlertTriangle,
          url: "/inventory/restock/warning",
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
  // No 'projects' section needed for this sidebar based on app-sidebar structure
}

export function InventorySidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Match the header style of app-sidebar.tsx but use Inventory icon/text */}
            <SidebarMenuButton size="lg" asChild isActive={pathname === "/inventory"}>
              <a href="/inventory"> {/* Link to inventory root or dashboard */}
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Warehouse className="size-4" /> {/* Inventory Icon */}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Inventory</span>
                  <span className="truncate text-xs">Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Use NavMain with the structured inventory data and pass pathname */}
        <NavMain items={data.navMain} pathname={pathname} />
        {/* No NavProjects needed based on app-sidebar structure */}
        {/* Use NavSecondary, placed at the bottom using mt-auto */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}