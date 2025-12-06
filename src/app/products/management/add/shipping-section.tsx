"use client"

import React, { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HelpCircle } from "lucide-react";

type ShippingSectionProps = {
  id?: string;
};

const ShippingSection = forwardRef<HTMLDivElement, ShippingSectionProps>(({ id }, ref) => {
  return (
    <Card ref={ref} id={id}>
      <CardHeader>
        <CardTitle>Pengiriman</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Berat Paket */}
        <div className="space-y-2">
          <Label htmlFor="package-weight" className="flex items-center">
            <span className="text-red-500 mr-1">*</span>Berat paket
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Masukkan berat produk setelah dikemas.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <div className="flex items-center gap-2">
            <Select defaultValue="g">
              <SelectTrigger id="weight-unit" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">Gram (g)</SelectItem>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
              </SelectContent>
            </Select>
            <Input id="package-weight" type="number" placeholder="Masukkan berat paket" className="flex-1" />
          </div>
        </div>

        {/* Dimensi Paket */}
        <div className="space-y-2">
          <Label className="flex items-center">
            Dimensi Paket
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ukuran paket setelah dikemas (opsional).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <p className="text-xs text-muted-foreground">Pastikan berat dan dimensi kotak akurat karena akan digunakan untuk menghitung biaya pengiriman dan metode pengiriman.</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Input id="package-height" type="number" placeholder="Tinggi" className="pr-10" />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">cm</span>
            </div>
            <div className="relative">
              <Input id="package-width" type="number" placeholder="Lebar" className="pr-10" />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">cm</span>
            </div>
            <div className="relative">
              <Input id="package-length" type="number" placeholder="Panjang" className="pr-10" />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">cm</span>
            </div>
          </div>
        </div>

        {/* Opsi Pengiriman */}
        <div className="space-y-2">
          <Label className="flex items-center">
            <span className="text-red-500 mr-1">*</span>Opsi Pengiriman
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pilih opsi pengiriman yang tersedia.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <div className="p-4 border rounded-md space-y-4 bg-muted/20">
            {/* Bayar di tempat (COD) */}
            <div className="flex items-center justify-between">
              <Label htmlFor="cod-switch" className="font-normal">Bayar di tempat (COD)</Label>
              <Switch id="cod-switch" />
            </div>
            <Separator />
            {/* Asuransi */}
            <div className="space-y-2">
              <Label className="font-normal">Asuransi</Label>
              <RadioGroup defaultValue="optional" className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="required" id="insurance-required" />
                  <Label htmlFor="insurance-required" className="font-normal">Wajib</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="optional" id="insurance-optional" />
                  <Label htmlFor="insurance-optional" className="font-normal">Opsional</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ShippingSection.displayName = "ShippingSection";

export default ShippingSection;