// Removed InventorySidebar, SiteHeader, SidebarInset, SidebarProvider imports

export const description = "Inventory management page"

export default function Page() {
  return (
    // Removed wrapping div, SidebarProvider, SiteHeader, InventorySidebar, SidebarInset
    <div className="flex flex-1 flex-col gap-4 p-4"> // Removed outer div and layout components
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
    // Removed closing tags for SidebarInset, div, SidebarProvider, div
  )
}