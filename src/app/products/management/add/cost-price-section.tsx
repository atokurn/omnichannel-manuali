"use client";

import React, { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface CostPriceSectionProps {
  showManualCostPrice: boolean;
  onToggleShowManualCostPrice: (checked: boolean) => void;
}

const CostPriceSection = forwardRef<HTMLDivElement, CostPriceSectionProps>(
  ({ showManualCostPrice, onToggleShowManualCostPrice }, ref) => {
    return (
      <Card ref={ref} id="harga-modal">
        <CardHeader>
          <CardTitle>Harga Modal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="calculated-cost-price">Harga Modal Dihitung</Label>
            <p className="text-xs text-muted-foreground">
              Harga modal dihitung otomatis berdasarkan bahan baku (fitur mendatang).
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="manual-cost-price-toggle" className="font-medium">
              Sesuaikan Harga Modal Manual
            </Label>
            <Switch
              id="manual-cost-price-toggle"
              checked={showManualCostPrice}
              onCheckedChange={(checked) => onToggleShowManualCostPrice(Boolean(checked))}
            />
          </div>
          {showManualCostPrice && (
            <div className="space-y-2">
              <Label htmlFor="manual-cost-price">Harga Modal Manual</Label>
              <Input id="manual-cost-price" type="number" placeholder="Masukkan harga modal manual" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

CostPriceSection.displayName = "CostPriceSection";

export default CostPriceSection;