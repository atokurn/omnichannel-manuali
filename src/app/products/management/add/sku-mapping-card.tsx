'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import ApiSyncSection from '@/components/products/ecommerce-sync/api-sync-section';

interface SkuMappingCardProps {
  productId?: string;
  selectedChannels?: string[];
  skuMappingOption?: string;
  enableSkuMapping?: boolean;
}

const SkuMappingCard = ({ 
  productId,
  selectedChannels: propSelectedChannels = [],
  skuMappingOption: propSkuMappingOption = 'all',
  enableSkuMapping: propEnableSkuMapping = false
}: SkuMappingCardProps) => {
  // State untuk SKU Mapping
  const [enableSkuMapping, setEnableSkuMapping] = useState(propEnableSkuMapping);
  const [skuMappingOption, setSkuMappingOption] = useState(propSkuMappingOption); // 'all', 'channel', 'store'
  
  // State untuk dialog
  const [openChannelDialog, setOpenChannelDialog] = useState(false);
  const [openStoreDialog, setOpenStoreDialog] = useState(false);
  
  // State untuk channel dan store yang dipilih
  const [selectedChannels, setSelectedChannels] = useState<string[]>(propSelectedChannels);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  
  // Data channel dan store (contoh data)
  const channels = ['Shopee', 'Tokopedia', 'TikTok Shop', 'Lazada'];
  const stores = [
    { id: '1', name: 'Toko Utama Shopee', channel: 'Shopee' },
    { id: '2', name: 'Toko Cabang Tokopedia', channel: 'Tokopedia' },
    { id: '3', name: 'Toko TikTok', channel: 'TikTok Shop' },
    { id: '4', name: 'Toko Lazada', channel: 'Lazada' },
  ];
  
  // Handler untuk perubahan opsi SKU Mapping
  const handleSkuMappingOptionChange = (option: string) => {
    setSkuMappingOption(option);
    if (option === 'all') {
      setSelectedChannels(channels);
      setSelectedStores(stores.map(store => store.id));
    } else {
      setSelectedChannels([]);
      setSelectedStores([]);
    }
  };
  
  // Handler untuk dialog channel
  const handleSaveChannels = () => {
    setOpenChannelDialog(false);
  };
  
  // Handler untuk dialog store
  const handleSaveStores = () => {
    setOpenStoreDialog(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SKU Mapping Ecommerce</CardTitle>
            <CardDescription>
              Pemetaan SKU untuk sinkronisasi stok dan pesanan di berbagai platform e-commerce.
            </CardDescription>
          </div>
          <Switch checked={enableSkuMapping} onCheckedChange={setEnableSkuMapping} />
        </div>
      </CardHeader>
      
      {enableSkuMapping && (
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Opsi Aktivasi */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="all-stores"
                  name="sku-mapping-option"
                  checked={skuMappingOption === 'all'}
                  onChange={() => handleSkuMappingOptionChange('all')}
                />
                <Label htmlFor="all-stores">Aktifkan Semua Toko</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="by-channel"
                  name="sku-mapping-option"
                  checked={skuMappingOption === 'channel'}
                  onChange={() => handleSkuMappingOptionChange('channel')}
                />
                <Label htmlFor="by-channel">Aktifkan Berdasarkan Channel</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="by-store"
                  name="sku-mapping-option"
                  checked={skuMappingOption === 'store'}
                  onChange={() => handleSkuMappingOptionChange('store')}
                />
                <Label htmlFor="by-store">Aktifkan Berdasarkan Toko</Label>
              </div>
            </div>
            
            {/* Tombol Pilih Channel/Store */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setOpenChannelDialog(true)}
                disabled={skuMappingOption !== 'channel'}
              >
                Pilih Channel
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setOpenStoreDialog(true)}
                disabled={skuMappingOption !== 'store'}
              >
                Pilih Toko
              </Button>
            </div>
            
            {/* Input SKU untuk setiap channel */}
            {(skuMappingOption === 'all' || 
              (skuMappingOption === 'channel' && selectedChannels.length > 0) || 
              (skuMappingOption === 'store' && selectedStores.length > 0)) && (
              <div className="space-y-4">
                <Separator />
                
                {/* Shopee */}
                {(skuMappingOption === 'all' || 
                  (skuMappingOption === 'channel' && selectedChannels.includes('Shopee')) || 
                  (skuMappingOption === 'store' && selectedStores.some(id => 
                    stores.find(store => store.id === id)?.channel === 'Shopee'
                  ))) && (
                  <div className="space-y-2">
                    <Label htmlFor="shopee-sku">SKU Shopee</Label>
                    <Input id="shopee-sku" placeholder="Masukkan SKU untuk Shopee" />
                  </div>
                )}
                
                {/* Tokopedia */}
                {(skuMappingOption === 'all' || 
                  (skuMappingOption === 'channel' && selectedChannels.includes('Tokopedia')) || 
                  (skuMappingOption === 'store' && selectedStores.some(id => 
                    stores.find(store => store.id === id)?.channel === 'Tokopedia'
                  ))) && (
                  <div className="space-y-2">
                    <Label htmlFor="tokopedia-sku">SKU Tokopedia</Label>
                    <Input id="tokopedia-sku" placeholder="Masukkan SKU untuk Tokopedia" />
                  </div>
                )}
                
                {/* TikTok Shop */}
                {(skuMappingOption === 'all' || 
                  (skuMappingOption === 'channel' && selectedChannels.includes('TikTok Shop')) || 
                  (skuMappingOption === 'store' && selectedStores.some(id => 
                    stores.find(store => store.id === id)?.channel === 'TikTok Shop'
                  ))) && (
                  <div className="space-y-2">
                    <Label htmlFor="tiktok-sku">SKU TikTok Shop</Label>
                    <Input id="tiktok-sku" placeholder="Masukkan SKU untuk TikTok Shop" />
                  </div>
                )}
                
                {/* Lazada */}
                {(skuMappingOption === 'all' || 
                  (skuMappingOption === 'channel' && selectedChannels.includes('Lazada')) || 
                  (skuMappingOption === 'store' && selectedStores.some(id => 
                    stores.find(store => store.id === id)?.channel === 'Lazada'
                  ))) && (
                  <div className="space-y-2">
                    <Label htmlFor="lazada-sku">SKU Lazada</Label>
                    <Input id="lazada-sku" placeholder="Masukkan SKU untuk Lazada" />
                  </div>
                )}
              </div>
            )}
            
            {/* Channel-specific details for TikTok Shop */}
            {skuMappingOption === 'channel' && selectedChannels.includes('TikTok Shop') && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="tiktok-condition">Kondisi Produk</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="condition-new" name="condition" />
                      <Label htmlFor="condition-new">Baru</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="condition-used" name="condition" />
                      <Label htmlFor="condition-used">Bekas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="condition-refurbished" name="condition" />
                      <Label htmlFor="condition-refurbished">Refurbished</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="tiktok-insurance" />
                  <Label htmlFor="tiktok-insurance">Asuransi Pengiriman</Label>
                </div>
              </>
            )}
            
            {/* Channel-specific details for Shopee */}
            {skuMappingOption === 'channel' && selectedChannels.includes('Shopee') && (
              <>
                <Separator />
                <div className="flex items-center space-x-2">
                  <Switch id="shopee-free-shipping" />
                  <Label htmlFor="shopee-free-shipping">Program Gratis Ongkir</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shopee-warranty">Garansi Produk</Label>
                  <select id="shopee-warranty" className="w-full p-2 border rounded">
                    <option value="">Pilih durasi garansi</option>
                    <option value="none">Tidak Ada Garansi</option>
                    <option value="7d">7 Hari</option>
                    <option value="14d">14 Hari</option>
                    <option value="30d">30 Hari</option>
                    <option value="1y">1 Tahun</option>
                  </select>
                </div>
              </>
            )}
            
            {/* Channel-specific details for Tokopedia */}
            {skuMappingOption === 'channel' && selectedChannels.includes('Tokopedia') && (
              <>
                <Separator />
                <div className="flex items-center space-x-2">
                  <Switch id="tokopedia-power-merchant" />
                  <Label htmlFor="tokopedia-power-merchant">Power Merchant</Label>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="tokopedia-preorder" />
                    <Label htmlFor="tokopedia-preorder">Preorder</Label>
                  </div>
                  
                  <div className="ml-6">
                    <Label htmlFor="tokopedia-preorder-days">Durasi Pengiriman (Hari)</Label>
                    <Input 
                      id="tokopedia-preorder-days" 
                      type="number" 
                      min="1" 
                      max="30"
                      placeholder="1-30 hari"
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Integrasi dengan ApiSyncSection */}
            <ApiSyncSection 
              productId={productId}
              selectedChannels={selectedChannels.length > 0 ? selectedChannels : channels}
              skuMappingOption={skuMappingOption}
              enableSkuMapping={enableSkuMapping}
            />
          </div>
        </CardContent>
      )}
      
      {/* Dialog Pilih Channel */}
      <Dialog open={openChannelDialog} onOpenChange={setOpenChannelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Channel</DialogTitle>
            <DialogDescription>
              Pilih channel e-commerce yang ingin diaktifkan untuk SKU Mapping.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {channels.map(channel => (
              <div key={channel} className="flex items-center space-x-2">
                <Checkbox
                  id={`channel-${channel}`}
                  checked={selectedChannels.includes(channel)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedChannels([...selectedChannels, channel]);
                    } else {
                      setSelectedChannels(selectedChannels.filter(c => c !== channel));
                    }
                  }}
                />
                <Label htmlFor={`channel-${channel}`}>{channel}</Label>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenChannelDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveChannels}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Pilih Toko */}
      <Dialog open={openStoreDialog} onOpenChange={setOpenStoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Toko</DialogTitle>
            <DialogDescription>
              Pilih toko e-commerce yang ingin diaktifkan untuk SKU Mapping.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {stores.map(store => (
              <div key={store.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`store-${store.id}`}
                  checked={selectedStores.includes(store.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedStores([...selectedStores, store.id]);
                    } else {
                      setSelectedStores(selectedStores.filter(id => id !== store.id));
                    }
                  }}
                />
                <Label htmlFor={`store-${store.id}`}>{store.name} ({store.channel})</Label>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenStoreDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveStores}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SkuMappingCard;