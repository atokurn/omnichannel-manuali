"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ProductData } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

export const columns: ColumnDef<ProductData>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-3">
                    {row.original.mainImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.original.mainImage} alt={row.original.name} className="h-10 w-10 text-[10px] rounded-md object-cover bg-muted" />
                    ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs">No Img</div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[200px]">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.sku || '-'}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => row.original.categoryName || <span className="text-muted-foreground italic">Uncategorized</span>,
    },
    {
        accessorKey: "price",
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("stock")}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            let variant: "default" | "secondary" | "destructive" | "outline" = "default"

            if (status === "In Stock") variant = "secondary" // Green-ish usually handled by class
            if (status === "Low Stock") variant = "outline" // Warning
            if (status === "Out of Stock") variant = "destructive"

            return (
                <Badge variant={variant} className={status === "In Stock" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0" : ""}>
                    {status}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(product.id)}
                        >
                            Copy Product ID
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/products/view/${product.id}`}>
                                View details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit product</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
