"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()
  
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/orders", label: "Orders" },
    { href: "/products", label: "Products" },
    { href: "/inventory", label: "Inventory" },
    { href: "/transaction", label: "Transaction" },
    { href: "/finance", label: "Keuangan" },
  ]

  return (
    <nav className={className}>
      <div className={`md:flex md:items-center md:space-x-4 ${className?.includes("flex-col") ? "flex flex-col items-center space-y-6" : ""}`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`font-medium transition-colors hover:text-primary hover:scale-105 ${pathname === item.href ? "text-primary font-bold" : "text-muted-foreground"} ${className?.includes("flex-col") ? "text-2xl py-2 px-4 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-1/2" : "text-sm"} transition-all duration-200`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}