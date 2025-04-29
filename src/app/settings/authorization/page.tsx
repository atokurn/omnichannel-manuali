"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PlusCircle } from "lucide-react"

// Placeholder data for e-commerce platforms
const platforms = [
  { name: "Shopee", logo: "/icons/shopee.svg", connected: false },
  { name: "TikTok Shop", logo: "/icons/tiktok.svg", connected: true }, // Example of a connected account
  { name: "Tokopedia", logo: "/icons/tokopedia.svg", connected: false },
  { name: "Lazada", logo: "/icons/lazada.svg", connected: false },
  { name: "Blibli", logo: "/icons/blibli.svg", connected: false },
  // Add more platforms as needed
]

export default function AuthorizationCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Authorization Center</h3>
        <p className="text-sm text-muted-foreground">
          Hubungkan dan kelola akun e-commerce Anda di sini.
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <Card key={platform.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{platform.name}</CardTitle>
              {/* Placeholder for platform logo - replace with actual image components if available */}
              {/* <img src={platform.logo} alt={`${platform.name} logo`} className="h-6 w-6" /> */}
              <span className="text-xs text-muted-foreground">Logo</span> {/* Temporary placeholder */}
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-4">
                {platform.connected ? "Terhubung" : "Belum terhubung"}
              </div>
              <Button size="sm" variant={platform.connected ? "outline" : "default"}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {platform.connected ? "Kelola Akun" : "Hubungkan Akun"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}