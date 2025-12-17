"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    Warehouse,
    ShoppingCart,
    Factory,
    Settings,
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

const dashboardNavData = {
    navMain: [
        {
            title: "Overview",
            url: "/dashboard",
            icon: LayoutDashboard,
            isActive: true,
            items: [],
        },
        {
            title: "Products",
            url: "/products",
            icon: Package,
            items: [
                { title: "Manajemen Produk", url: "/products/management" },
                { title: "Kategori", url: "/products/categories" },
                { title: "Material", url: "/products/materials" },
                { title: "Supplier", url: "/products/suppliers" },
                { title: "Komposisi", url: "/products/composition" },
            ],
        },
        {
            title: "Inventory",
            url: "/inventory",
            icon: Warehouse,
            items: [
                { title: "Stock In", url: "/inventory/stock/stock-in" },
                { title: "Stock Out", url: "/inventory/stock/stock-out" },
                { title: "Stock Movement", url: "/inventory/stock/movement" },
                { title: "Warehouses", url: "/inventory/warehouse/warehouses" },
                { title: "Areas", url: "/inventory/warehouse/areas" },
                { title: "Shelves", url: "/inventory/warehouse/shelves" },
            ],
        },
        {
            title: "Orders",
            url: "/orders",
            icon: ShoppingCart,
            items: [
                { title: "Semua Order", url: "/orders/all" },
                { title: "Penjualan", url: "/orders/sales" },
                { title: "Completed", url: "/orders/completed" },
                { title: "Shipped", url: "/orders/shipped" },
                { title: "Cancelled", url: "/orders/cancelled" },
            ],
        },
        {
            title: "Production",
            url: "/production",
            icon: Factory,
            items: [
                { title: "Production List", url: "/production" },
                { title: "Create Batch", url: "/production/add" },
            ],
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
            items: [
                { title: "Account", url: "/settings/account" },
                { title: "Authorization", url: "/settings/authorization" },
            ],
        },
    ],
    navSecondary: [
        { title: "Support", url: "#", icon: LifeBuoy },
        { title: "Feedback", url: "#", icon: Send },
    ],
}

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild isActive={pathname === "/dashboard"}>
                            <a href="/dashboard">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <LayoutDashboard className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Inventory System</span>
                                    <span className="truncate text-xs text-muted-foreground">Dashboard</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={dashboardNavData.navMain} pathname={pathname} />
                <NavSecondary items={dashboardNavData.navSecondary} className="mt-auto" />
            </SidebarContent>
        </Sidebar>
    )
}
