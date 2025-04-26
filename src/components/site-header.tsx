"use client"

import { useState } from "react"
import { SidebarIcon, X, Menu, Search } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        {/* Desktop Navigation */}
        <MainNav className="hidden md:flex" />
        
        {/* Mobile Menu Button */}
        <Button
          className="md:hidden h-8 w-8 ml-auto"
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
        
        <div className="ml-auto hidden md:flex items-center gap-2">
          <SearchForm />
          <ThemeToggle />
        </div>
        
        {/* Mobile Navigation Overlay - Fullscreen */}
        <div 
          className={`fixed inset-0 z-50 bg-background md:hidden flex flex-col transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
          <div className="flex justify-center relative pt-10 pb-6">
            <Button
              className="h-12 w-12 absolute top-4 right-4"
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-7 w-7" />
            </Button>
            
            <div className="text-center text-3xl font-bold tracking-tight">Menu</div>
          </div>
          
          <div className="flex flex-col items-center space-y-10 px-6 flex-grow justify-center">
            <MainNav className="flex flex-col items-center space-y-8" />
          </div>
          
          <div className="mt-auto p-8 w-full">
            <div className="rounded-full border-2 border-primary overflow-hidden flex items-center px-6 py-3 hover:bg-primary/5 transition-colors">
              <span className="mr-2 font-medium text-lg">Let's talk</span>
              <div className="ml-auto bg-primary rounded-full p-2.5">
                <Search className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
