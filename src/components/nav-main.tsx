"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Define a more flexible type for items
export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: NavItem[] // Allow nested items for the default case
}

export function NavMain({ items, isSettings, pathname }: { items: NavItem[]; isSettings?: boolean; pathname?: string }) {
  // Get current pathname for active state checking
  const currentPathname = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  
  if (isSettings) {
    // Render a flat list for settings sidebar
    return (
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {/* Use pathname to determine isActive state */}
            <SidebarMenuButton asChild tooltip={item.title} isActive={currentPathname === item.url}>
              <a href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    )
  }

  // Original rendering logic for non-settings sidebars
  return (
    <div>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => {
            // Check if this item or any of its subitems is active
            const hasActiveSubItem = item.items?.some(subItem => currentPathname === subItem.url);
            const isItemActive = currentPathname === item.url || hasActiveSubItem;
            
            // Only set defaultOpen to true if the item is active
            // This ensures only active menu sections are expanded
            const isOpen = isItemActive;
            
            return (
              <Collapsible key={item.title} asChild defaultOpen={isOpen}>
                <SidebarMenuItem>
                  {!item.items?.length ? (
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title} 
                      isActive={isItemActive}
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  ) : (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          asChild 
                          tooltip={item.title} 
                          isActive={isItemActive}
                        >
                          <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
                          </a>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild
                                isActive={currentPathname === subItem.url}
                              >
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </div>
  )
}
