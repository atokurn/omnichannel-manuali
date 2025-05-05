import * as React from "react"

import { SiteHeader } from "@/components/site-header"
import { SettingsSidebar } from "@/components/settings-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40"> {/* Added min-h-screen bg-muted/40 */}
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <SettingsSidebar/>
          <SidebarInset>
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}