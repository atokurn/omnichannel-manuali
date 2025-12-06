"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, HelpCircle } from "lucide-react";

interface SalesInfoSectionProps {
  addVariant: boolean;
  onToggleAddVariant: (checked: boolean) => void;
  defaultPrice: string;
  onDefaultPriceChange: (value: string) => void;
  defaultQuantity: string;
  onDefaultQuantityChange: (value: string) => void;
}

const SalesInfoSection: React.FC<SalesInfoSectionProps> = ({
  addVariant,
  onToggleAddVariant,
  defaultPrice,
  onDefaultPriceChange,
  defaultQuantity,
  onDefaultQuantityChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Tambah Varian Switch */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="add-variant" className="font-medium">Tambah varian</Label>
          <p className="text-xs text-muted-foreground">Tambahkan hingga 3 varian.</p>
        </div>
        <Switch id="add-variant" checked={addVariant} onCheckedChange={(checked) => onToggleAddVariant(Boolean(checked))} />
      </div>

      {/* Conditionally render Price & Stock section */}
      {!addVariant && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="flex items-center font-medium">
              <span className="text-red-500 mr-1">*</span>Harga & Stok
            </Label>
            <div className="flex items-center gap-2">
              {/* Pre-order Checkbox moved here */}
              <Checkbox id="pre-order" />
              <Label htmlFor="pre-order" className="text-sm font-normal flex items-center">
                Pre-order
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Aktifkan jika produk ini memerlukan pre-order.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              {/* End Pre-order Checkbox */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Ubah sekaligus <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ubah Harga</DropdownMenuItem>
                  <DropdownMenuItem>Ubah Kuantitas</DropdownMenuItem>
                  <DropdownMenuItem>Ubah SKU</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="product-price" className="text-xs flex items-center">
                <span className="text-red-500 mr-1">*</span>Harga jual
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Harga jual akhir produk.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">Rp</span>
                <Input 
                  id="product-price" 
                  type="number" 
                  placeholder="0" 
                  className="pl-8" 
                  value={defaultPrice}
                  onChange={(e) => onDefaultPriceChange(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="product-quantity" className="text-xs flex items-center">
                <span className="text-red-500 mr-1">*</span>Kuantitas
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Jumlah stok produk yang tersedia.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input 
                id="product-quantity" 
                type="number" 
                placeholder="0" 
                value={defaultQuantity} 
                onChange={(e) => onDefaultQuantityChange(e.target.value)} 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="product-sku" className="text-xs flex items-center">
                SKU Penjual
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Kode unik (Stock Keeping Unit) untuk produk ini.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input id="product-sku" placeholder="Masukkan SKU" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInfoSection;