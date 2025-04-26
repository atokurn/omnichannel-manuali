'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LowStockItem {
  id: string;
  product: {
    id: string;
    name: string;
    minStockLevel: number;
  };
  quantity: number;
  warehouse: {
    id: string;
    name: string;
  };
}

export function LowStockNotification() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [open, setOpen] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Initial fetch of low stock items
    fetchLowStockItems();

    // Setup WebSocket connection
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'LOW_STOCK_ALERT') {
          // Add new low stock item to the list
          setLowStockItems(prev => {
            // Check if item already exists
            const exists = prev.some(item => 
              item.product.id === data.item.product.id && 
              item.warehouse.id === data.item.warehouse.id
            );
            
            if (exists) {
              // Update existing item
              return prev.map(item => 
                (item.product.id === data.item.product.id && 
                 item.warehouse.id === data.item.warehouse.id) 
                  ? data.item 
                  : item
              );
            } else {
              // Add new item
              return [...prev, data.item];
            }
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    setSocket(ws);
    
    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  async function fetchLowStockItems() {
    try {
      const response = await fetch('/api/products?lowStock=true');
      if (!response.ok) {
        throw new Error('Failed to fetch low stock items');
      }
      const data = await response.json();
      
      // Transform data to match expected format
      const formattedItems = data.flatMap((product: any) => 
        product.inventories
          .filter((inv: any) => inv.quantity < product.minStockLevel)
          .map((inv: any) => ({
            id: inv.id,
            product: {
              id: product.id,
              name: product.name,
              minStockLevel: product.minStockLevel
            },
            quantity: inv.quantity,
            warehouse: {
              id: inv.warehouseId,
              name: 'Warehouse' // This would need to be fetched or included in the API response
            }
          }))
      );
      
      setLowStockItems(formattedItems);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    }
  }

  function dismissItem(itemId: string) {
    setLowStockItems(prev => prev.filter(item => item.id !== itemId));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {lowStockItems.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {lowStockItems.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-3">
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>
              {lowStockItems.length} {lowStockItems.length === 1 ? 'product' : 'products'} below minimum stock level
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-auto space-y-2 p-0">
            {lowStockItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No low stock alerts</p>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} / Min: {item.product.minStockLevel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.warehouse.name}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => dismissItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}