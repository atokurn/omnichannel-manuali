"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category?: {
    name: string;
  };
  price: number;
  cost?: number;
  totalStock: number;
  hasVariants: boolean;
  variantCount?: number;
  minVariantPrice?: number;
  maxVariantPrice?: number;
  combinations?: VariantCombination[];
  mainImage?: string;
}

interface VariantCombination {
  id: string;
  combinationId: string;
  options: Record<string, string>;
  price: number;
  quantity: number;
  sku: string;
}

interface SelectProductsDialogProps {
  trigger: React.ReactNode;
  onSave: (selectedProducts: any[]) => void; // Define a more specific type later
  initialSelectedProducts?: any[]; // Menambahkan prop untuk produk yang sudah dipilih sebelumnya
}

export function SelectProductsDialog({ trigger, onSave, initialSelectedProducts = [] }: SelectProductsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inisialisasi produk yang sudah dipilih sebelumnya
  useEffect(() => {
    if (isOpen && initialSelectedProducts && initialSelectedProducts.length > 0) {
      const selectedProductsMap: Record<string, boolean> = {};
      const selectedVariantsMap: Record<string, string> = {};
      
      initialSelectedProducts.forEach(item => {
        if (item.variantId) {
          // Jika ini adalah varian, tandai produk induk sebagai dipilih
          selectedProductsMap[item.productId] = true;
          // Dan tandai varian spesifik sebagai dipilih
          selectedVariantsMap[item.variantId] = item.productId;
        } else {
          // Jika ini adalah produk non-varian
          selectedProductsMap[item.id] = true;
        }
      });
      
      setSelectedProducts(selectedProductsMap);
      setSelectedVariants(selectedVariantsMap);
    }
  }, [isOpen, initialSelectedProducts]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/products?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.data || []);
      } catch (err) {
        setError('Error loading products. Please try again.');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    if (isOpen) {
      fetchProducts();
      fetchCategories();
    }
  }, [isOpen]);

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => ({ ...prev, [productId]: checked }));
    
    // If unchecking, remove any selected variants for this product
    if (!checked) {
      const updatedVariants = { ...selectedVariants };
      const product = products.find(p => p.id === productId);
      if (product?.hasVariants && product.combinations) {
        product.combinations.forEach(combo => {
          delete updatedVariants[combo.id];
        });
      }
      setSelectedVariants(updatedVariants);
    }
  };

  const handleSelectVariant = (variantId: string, productId: string, checked: boolean) => {
    setSelectedVariants(prev => ({ ...prev, [variantId]: checked ? productId : '' }));
  };

  const handleSave = () => {
    const selectedItems = [];
    
    // Add non-variant products
    products.forEach(product => {
      if (selectedProducts[product.id] && !product.hasVariants) {
        selectedItems.push({
          id: product.id,
          productId: product.id, // Tambahkan productId untuk konsistensi
          name: product.name,
          sku: product.sku,
          price: product.price,
          buyPrice: product.cost || product.price, // Gunakan cost jika ada, jika tidak gunakan price
          stock: product.totalStock,
          hasVariants: false,
          mainImage: product.mainImage
        });
      }
    });
    
    // Add selected variants
    Object.entries(selectedVariants).forEach(([variantId, productId]) => {
      if (productId) {
        const product = products.find(p => p.id === productId);
        const variant = product?.combinations?.find(v => v.id === variantId);
        
        if (product && variant) {
          // Format variant options for display
          const optionsText = Object.entries(variant.options)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          
          selectedItems.push({
            id: product.id,
            productId: product.id, // Tambahkan productId untuk referensi produk induk
            variantId: variant.id,
            name: `${product.name} (${optionsText})`,
            sku: variant.sku || product.sku,
            price: variant.price,
            buyPrice: variant.price, // Gunakan harga varian sebagai buyPrice
            stock: variant.quantity,
            hasVariants: true,
            options: variant.options,
            mainImage: product.mainImage
          });
        }
      }
    });
    
    onSave(selectedItems);
    setIsOpen(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
      product.category?.name.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filters
  const uniqueCategories = ['all', ...categories.map(c => c.name)];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
          <DialogDescription>
            Choose products to add to your purchase order
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:col-span-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Categories" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category === 'all' ? 'All Categories' : category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[400px] text-destructive">
              {error}
            </div>
          ) : (
            <ScrollArea className="h-[400px] border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>CODE/SKU</TableHead>
                    <TableHead>NAME</TableHead>
                    <TableHead>CATEGORY</TableHead>
                    <TableHead className="text-right">STOCK</TableHead>
                    <TableHead className="text-right">PRICE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">No products found</TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <React.Fragment key={product.id}>
                        <TableRow>
                          <TableCell>
                            <Checkbox
                              checked={!!selectedProducts[product.id]}
                              onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                              aria-label={`Select ${product.name}`}
                            />
                          </TableCell>
                          <TableCell>{product.sku || '-'}</TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                            {product.hasVariants && (
                              <Badge variant="outline" className="ml-2">Has Variants</Badge>
                            )}
                          </TableCell>
                          <TableCell>{product.category?.name || '-'}</TableCell>
                          <TableCell className="text-right">{product.totalStock}</TableCell>
                          <TableCell className="text-right">
                            {product.hasVariants 
                              ? `Rp ${product.minVariantPrice?.toLocaleString('id-ID')} - ${product.maxVariantPrice?.toLocaleString('id-ID')}` 
                              : `Rp ${product.price?.toLocaleString('id-ID')}`}
                          </TableCell>
                        </TableRow>
                        
                        {/* Show variants if product has them and is selected */}
                        {product.hasVariants && selectedProducts[product.id] && product.combinations && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={6} className="p-0">
                              <div className="pl-10 pr-4 py-2">
                                <div className="text-sm font-medium mb-2">Select Variants:</div>
                                <div className="space-y-1">
                                  {product.combinations.map(variant => {
                                    // Format variant options for display
                                    const optionsText = Object.entries(variant.options)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ');
                                    
                                    return (
                                      <div key={variant.id} className="grid grid-cols-12 gap-2 items-center text-sm">
                                        <div className="col-span-1">
                                          <Checkbox
                                            checked={!!selectedVariants[variant.id]}
                                            onCheckedChange={(checked) => 
                                              handleSelectVariant(variant.id, product.id, !!checked)
                                            }
                                            aria-label={`Select variant ${optionsText}`}
                                          />
                                        </div>
                                        <div className="col-span-5">{optionsText}</div>
                                        <div className="col-span-2">{variant.sku || '-'}</div>
                                        <div className="col-span-2 text-right">{variant.quantity}</div>
                                        <div className="col-span-2 text-right">
                                          Rp {variant.price.toLocaleString('id-ID')}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}