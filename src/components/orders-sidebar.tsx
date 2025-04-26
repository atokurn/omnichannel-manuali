"use client"

import * as React from "react"
import {
  ChevronRight,
  ShoppingCart,
  Package,
  Truck,
  ClipboardList,
  BarChart4,
  Users,
  Calendar,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

interface NavItemProps {
  title: string
  icon: LucideIcon
  url?: string
  items?: {
    title: string
    url: string
  }[]
}

function NavCategory({ title, items }: { title: string; items: NavItemProps[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={item.title} asChild={item.url ? true : undefined}>
                {item.url ? (
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                ) : (
                  <>
                    <item.icon />
                    <span>{item.title}</span>
                  </>
                )}
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function OrdersSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const orderItems: NavItemProps[] = [
    {
      title: "All Orders",
      icon: ShoppingCart,
      url: "/orders/all",
    },
    {
      title: "Pending",
      icon: Calendar,
      url: "/orders/pending",
    },
    {
      title: "Processing",
      icon: Package,
      url: "/orders/processing",
    },
    {
      title: "Shipped",
      icon: Truck,
      url: "/orders/shipped",
    },
    {
      title: "Completed",
      icon: ClipboardList,
      url: "/orders/completed",
    },
    {
      title: "Cancelled",
      icon: FileText,
      url: "/orders/cancelled",
    },
  ]

  const manualItems: NavItemProps[] = [
    {
      title: "Order",
      icon: BarChart4,
      url: "/orders/orders",
    },
    {
      title: "Sales",
      icon: Users,
      url: "/orders/sales",
    },
  ]

  const analyticsItems: NavItemProps[] = [
    {
      title: "Sales Overview",
      icon: BarChart4,
      url: "/orders/analytics/overview",
    },
    {
      title: "Customer Insights",
      icon: Users,
      url: "/orders/analytics/customers",
    },
  ]

  const settingsItems: NavItemProps[] = [
    {
      title: "Order Settings",
      icon: Settings,
      url: "/orders/settings",
    },
  ]

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <ShoppingCart className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Orders</span>
                <span className="truncate text-xs">Management</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavCategory title="Orders" items={orderItems} />
        <NavCategory title="Manual Import" items={manualItems} />
        <NavCategory title="Analytics" items={analyticsItems} />
        <NavCategory title="Settings" items={settingsItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}