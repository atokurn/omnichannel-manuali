"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, GripVertical, HelpCircle, ImageIcon, Plus, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface VariantOption {
  id: string;
  value: string;
  charCount: number;
  image?: File | null;
}

export interface VariantItem {
  id: string;
  name: string;
  options: VariantOption[];
}

export interface VariantCombinationData {
  combinationId: string;
  options: Record<string, string>;
  price: string;
  quantity: string;
  sku: string;
  weight: string;
  weightUnit: "g" | "kg";
}

interface VariantsEditorProps {
  addVariant: boolean;
  variants: VariantItem[];
  variantTableData: VariantCombinationData[];
  onAddVariantSection: () => void;
  onRemoveVariantSection: (variantId: string) => void;
  onVariantNameChange: (variantId: string, name: string) => void;
  onRemoveVariantOption: (variantId: string, optionId: string) => void;
  onVariantOptionValueChange: (variantId: string, optionId: string, value: string) => void;
  onVariantOptionImageChange: (variantId: string, optionId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onVariantTableInputChange: (combinationId: string, field: keyof VariantCombinationData, value: string) => void;
  onWeightUnitChange: (combinationId: string, unit: "g" | "kg") => void;
  onRemoveVariantCombination: (combinationId: string) => void;
}

const VariantsEditor: React.FC<VariantsEditorProps> = ({
  addVariant,
  variants,
  variantTableData,
  onAddVariantSection,
  onRemoveVariantSection,
  onVariantNameChange,
  onRemoveVariantOption,
  onVariantOptionValueChange,
  onVariantOptionImageChange,
  onVariantTableInputChange,
  onWeightUnitChange,
  onRemoveVariantCombination,
}) => {
  return (
    <>
      {/* Variant Creation Forms (Conditional & Mapped) */}
      {addVariant && variants.map((variant) => (
        <div key={variant.id} className="space-y-4 p-4 border rounded-md bg-muted/20 relative">
          {/* Delete Variant Section Button */}
          {variants.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onRemoveVariantSection(variant.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          {/* Variant Name */}
          <div className="space-y-2">
            <Label htmlFor={`variant-name-${variant.id}`} className="flex items-center">
              <span className="text-red-500 mr-1">*</span>Nama Varian
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Masukkan nama untuk grup varian (mis. Warna, Ukuran).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select onValueChange={(value) => onVariantNameChange(variant.id, value)} value={variant.name}>
              <SelectTrigger id={`variant-name-${variant.id}`}>
                <SelectValue placeholder="Pilih atau masukkan varian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Warna">Warna</SelectItem>
                <SelectItem value="Ukuran">Ukuran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Variant Options (Mapped) */}
          {variant.options.map((option, optionIndex) => (
            <div key={option.id} className="space-y-2">
              {optionIndex === 0 && (
                <Label htmlFor={`variant-value-${option.id}`} className="flex items-center">
                  <span className="text-red-500 mr-1">*</span>Nilai varian
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Masukkan opsi untuk varian ini (mis. Merah, XL). Ketik di baris terakhir untuk menambah opsi baru.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              )}
              <div className="flex items-start gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor={`variant-image-upload-${option.id}`} className="border rounded-lg flex flex-col items-center justify-center p-4 aspect-square text-center hover:border-primary cursor-pointer bg-background w-24 h-24 shrink-0">
                        {option.image ? (
                          <img src={URL.createObjectURL(option.image)} alt="Preview" className="h-full w-full object-cover rounded-md" />
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Unggah gambar</span>
                          </>
                        )}
                        <Input
                          id={`variant-image-upload-${option.id}`}
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => onVariantOptionImageChange(variant.id, option.id, e)}
                        />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unggah gambar untuk opsi varian ini (opsional).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id={`variant-value-${option.id}`}
                      placeholder={optionIndex === variant.options.length - 1 && optionIndex > 0 ? "Tambahkan nilai lain" : "Masukkan opsi"}
                      maxLength={50}
                      value={option.value}
                      onChange={(e) => onVariantOptionValueChange(variant.id, option.id, e.target.value)}
                    />
                    <span className="absolute right-3 bottom-2 text-xs text-muted-foreground">{option.charCount}/50</span>
                  </div>
                  {(variants.length > 1 && !(optionIndex === variant.options.length - 1 && option.value === '')) ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            onClick={() => onRemoveVariantOption(variant.id, option.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hapus opsi</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div className="w-9 h-9"></div>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground cursor-move">
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pindahkan (fungsi belum aktif)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Button to Add New Variant Section */}
      {addVariant && variants.length < 3 && (
        <Button variant="outline" className="w-full border-dashed" onClick={onAddVariantSection}>
          <Plus className="h-4 w-4 mr-2" /> Tambah varian ({variants.length}/3)
        </Button>
      )}

      {/* Variant Combination Table (List Varian) */}
      {addVariant && variantTableData.length > 0 && (
        <div className="mt-6 space-y-4">
          <Separator />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="text-red-500 mr-1">*</span>List Varian
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Ubah sekaligus <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ubah Harga</DropdownMenuItem>
                <DropdownMenuItem>Ubah Kuantitas</DropdownMenuItem>
                <DropdownMenuItem>Ubah Berat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Checkbox id="pre-order" />
            <Label htmlFor="pre-order" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
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
          </div>

          <ScrollArea className="max-h-[400px] w-full">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-muted/50 z-10">
                <TableRow>
                  {variants.filter(v => v.name).map(variant => (
                    <TableHead key={variant.id}>{variant.name}</TableHead>
                  ))}
                  <TableHead className="min-w-[150px]"><span className="text-red-500 mr-1">*</span>Harga jual</TableHead>
                  <TableHead className="min-w-[120px]"><span className="text-red-500 mr-1">*</span>Kuantitas</TableHead>
                  <TableHead className="min-w-[150px]">SKU Penjual</TableHead>
                  <TableHead className="min-w-[180px]"><span className="text-red-500 mr-1">*</span>Berat dengan kemasan</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variantTableData.map((combination) => (
                  <TableRow key={combination.combinationId}>
                    {variants.filter(v => v.name).map(variant => (
                      <TableCell key={`${combination.combinationId}-${variant.id}`}>{combination.options[variant.name] || '-'}</TableCell>
                    ))}
                    <TableCell>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          placeholder="0"
                          className="pl-8"
                          value={combination.price}
                          onChange={(e) => onVariantTableInputChange(combination.combinationId, 'price', e.target.value)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={combination.quantity}
                        onChange={(e) => onVariantTableInputChange(combination.combinationId, 'quantity', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Masukkan SKU"
                        value={combination.sku}
                        onChange={(e) => onVariantTableInputChange(combination.combinationId, 'sku', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          placeholder="0"
                          className="flex-1"
                          value={combination.weight}
                          onChange={(e) => onVariantTableInputChange(combination.combinationId, 'weight', e.target.value)}
                        />
                        <Select value={combination.weightUnit} onValueChange={(value) => onWeightUnitChange(combination.combinationId, value as 'g' | 'kg')}>
                          <SelectTrigger className="w-[60px] shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemoveVariantCombination(combination.combinationId)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Hapus Varian</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default VariantsEditor;