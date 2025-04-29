import * as React from "react"

import { SiteHeader } from "@/components/site-header"
import { SettingsSidebar } from "@/components/settings-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"; // Added import

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
    <SidebarProvider className="flex flex-col"> {/* Added SidebarProvider wrapper */}
        <SiteHeader />
        <div className="flex flex-1">
          <SettingsSidebar/>
          <div className="flex-1 p-4 pl-[--sidebar-width]">
          <main className="flex w-full flex-col overflow-hidden py-6">
            {children}
          </main>
          </div>
        </div>
    </SidebarProvider> /* Added SidebarProvider wrapper */
    </div>
  )
}