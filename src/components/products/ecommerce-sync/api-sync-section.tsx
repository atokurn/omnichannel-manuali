'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
// Mengganti import useToast dengan sonner
import { toast } from 'sonner';

interface ApiSyncSectionProps {
  productId?: string;
  selectedChannels: string[];
  skuMappingOption: string;
  enableSkuMapping: boolean;
}

const ApiSyncSection = ({
  productId,
  selectedChannels,
  skuMappingOption,
  enableSkuMapping
}: ApiSyncSectionProps) => {
  // Menghapus const { toast } = useToast();
  const [enableApiSync, setEnableApiSync] = useState(false);
  const [syncPlatforms, setSyncPlatforms] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [syncLogs, setSyncLogs] = useState<any[]>([]);

  // Fungsi untuk menangani perubahan nilai field
  const handleFieldValueChange = (platform: string, field: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [`${platform}_${field}`]: value
    }));
  };

  // Fungsi untuk mengirim permintaan sinkronisasi
  const handleSync = async () => {
    if (!productId) {
      // Mengubah penggunaan toast
      toast.error("ID Produk tidak tersedia. Simpan produk terlebih dahulu.");
      return;
    }

    if (syncPlatforms.length === 0) {
      // Mengubah penggunaan toast
      toast.error("Pilih minimal satu platform untuk sinkronisasi.");
      return;
    }

    setSyncStatus('loading');

    try {
      const response = await fetch('/api/products/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          platformIds: syncPlatforms.map(platform => platform), // Ini seharusnya ID platform dari database
          fieldValues: fieldValues,
          syncAll: skuMappingOption === 'all'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSyncStatus('success');
        // Mengubah penggunaan toast
        toast.success("Produk berhasil disinkronkan ke platform e-commerce.");

        // Ambil log sinkronisasi terbaru
        fetchSyncLogs();
      } else {
        setSyncStatus('error');
        // Mengubah penggunaan toast
        toast.error(data.message || "Terjadi kesalahan saat sinkronisasi produk.");
      }
    } catch (error) {
      setSyncStatus('error');
      // Mengubah penggunaan toast
      toast.error("Terjadi kesalahan saat menghubungi server.");
    }
  };

  // Fungsi untuk mengambil log sinkronisasi
  const fetchSyncLogs = async () => {
    if (!productId) return;

    try {
      const response = await fetch(`/api/products/sync?productId=${productId}`);
      const data = await response.json();

      if (response.ok) {
        setSyncLogs(data.syncLogs || []);
      }
    } catch (error) {
      console.error('Failed to fetch sync logs:', error);
    }
  };

  // Ambil log sinkronisasi saat komponen dimuat
  useEffect(() => {
    if (productId && enableApiSync) {
      fetchSyncLogs();
    }
  }, [productId, enableApiSync]);

  // Jika SKU Mapping tidak diaktifkan, jangan tampilkan bagian sinkronisasi API
  if (!enableSkuMapping) return null;

  return (
    <div className="space-y-4 mt-4">
      <Separator />
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="api-sync-switch" className="font-medium">Sinkronisasi API E-commerce</Label>
          <p className="text-xs text-muted-foreground">Aktifkan untuk sinkronisasi otomatis dengan platform e-commerce.</p>
        </div>
        <Switch id="api-sync-switch" checked={enableApiSync} onCheckedChange={setEnableApiSync} />
      </div>
      
      {enableApiSync && (
        <>
          <div className="space-y-2 mt-2">
            <Label>Pilih Platform untuk Sinkronisasi</Label>
            <div className="grid grid-cols-3 gap-2">
              {selectedChannels.map(channel => (
                <div key={channel} className="flex items-center space-x-2 border rounded-md p-2">
                  <Checkbox 
                    id={`sync-${channel}`} 
                    checked={syncPlatforms.includes(channel)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSyncPlatforms([...syncPlatforms, channel]);
                      } else {
                        setSyncPlatforms(syncPlatforms.filter(p => p !== channel));
                      }
                    }}
                  />
                  <Label htmlFor={`sync-${channel}`}>{channel}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <Tabs defaultValue="fields" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fields">Field Spesifik Platform</TabsTrigger>
              <TabsTrigger value="logs">Log Sinkronisasi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fields" className="space-y-4">
              {/* Tampilkan field spesifik platform untuk setiap platform yang dipilih */}
              {syncPlatforms.map(platform => (
                <Card key={platform} className="mt-4">
                  <CardHeader>
                    <CardTitle>{platform} - Field Spesifik</CardTitle>
                    <CardDescription>Isi informasi tambahan yang diperlukan untuk {platform}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Field spesifik untuk TikTok Shop */}
                    {platform === 'TikTok Shop' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="tiktok-condition">Kondisi Produk</Label>
                          <Select 
                            onValueChange={(value) => handleFieldValueChange('tiktok', 'condition', value)}
                            value={fieldValues['tiktok_condition'] || ''}
                          >
                            <SelectTrigger id="tiktok-condition">
                              <SelectValue placeholder="Pilih kondisi produk" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Baru</SelectItem>
                              <SelectItem value="used">Bekas</SelectItem>
                              <SelectItem value="refurbished">Refurbished</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="tiktok-insurance" 
                            checked={fieldValues['tiktok_insurance'] || false}
                            onCheckedChange={(checked) => handleFieldValueChange('tiktok', 'insurance', checked)}
                          />
                          <Label htmlFor="tiktok-insurance">Asuransi Pengiriman</Label>
                        </div>
                      </>
                    )}
                    
                    {/* Field spesifik untuk Shopee */}
                    {platform === 'Shopee' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="shopee-free-shipping" 
                            checked={fieldValues['shopee_free_shipping'] || false}
                            onCheckedChange={(checked) => handleFieldValueChange('shopee', 'free_shipping', checked)}
                          />
                          <Label htmlFor="shopee-free-shipping">Program Gratis Ongkir</Label>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="shopee-warranty">Garansi Produk</Label>
                          <Select 
                            onValueChange={(value) => handleFieldValueChange('shopee', 'warranty', value)}
                            value={fieldValues['shopee_warranty'] || ''}
                          >
                            <SelectTrigger id="shopee-warranty">
                              <SelectValue placeholder="Pilih durasi garansi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Tidak Ada Garansi</SelectItem>
                              <SelectItem value="7d">7 Hari</SelectItem>
                              <SelectItem value="14d">14 Hari</SelectItem>
                              <SelectItem value="30d">30 Hari</SelectItem>
                              <SelectItem value="1y">1 Tahun</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    
                    {/* Field spesifik untuk Tokopedia */}
                    {platform === 'Tokopedia' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="tokopedia-power-merchant" 
                            checked={fieldValues['tokopedia_power_merchant'] || false}
                            onCheckedChange={(checked) => handleFieldValueChange('tokopedia', 'power_merchant', checked)}
                          />
                          <Label htmlFor="tokopedia-power-merchant">Power Merchant</Label>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="tokopedia-preorder" 
                              checked={fieldValues['tokopedia_preorder'] || false}
                              onCheckedChange={(checked) => handleFieldValueChange('tokopedia', 'preorder', checked)}
                            />
                            <Label htmlFor="tokopedia-preorder">Preorder</Label>
                          </div>
                          
                          {fieldValues['tokopedia_preorder'] && (
                            <div className="ml-6 mt-2">
                              <Label htmlFor="tokopedia-preorder-days">Durasi Pengiriman (Hari)</Label>
                              <Input 
                                id="tokopedia-preorder-days" 
                                type="number" 
                                min="1" 
                                max="30"
                                placeholder="1-30 hari"
                                value={fieldValues['tokopedia_preorder_days'] || ''}
                                onChange={(e) => handleFieldValueChange('tokopedia', 'preorder_days', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    
                    {/* Pemetaan Kategori */}
                    <div className="space-y-2 mt-4">
                      <Label htmlFor={`${platform}-category`}>Kategori {platform}</Label>
                      <Select 
                        onValueChange={(value) => handleFieldValueChange(platform.toLowerCase().replace(' ', '_'), 'category', value)}
                        value={fieldValues[`${platform.toLowerCase().replace(' ', '_')}_category`] || ''}
                      >
                        <SelectTrigger id={`${platform}-category`}>
                          <SelectValue placeholder={`Pilih kategori ${platform}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Kategori platform akan diisi dinamis dari API */}
                          <SelectItem value="category1">Elektronik &gt; Handphone</SelectItem>
                          <SelectItem value="category2">Fashion &gt; Pakaian Pria</SelectItem>
                          <SelectItem value="category3">Komputer &gt; Laptop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              {syncLogs.length > 0 ? (
                <div className="space-y-4">
                  {syncLogs.map((log, index) => (
                    <Alert key={index} variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}>
                      {log.status === 'SUCCESS' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>{log.status === 'SUCCESS' ? 'Berhasil' : 'Gagal'} - {new Date(log.createdAt).toLocaleString()}</AlertTitle>
                      <AlertDescription>
                        Platform: {log.platformName}<br />
                        {log.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Belum ada log sinkronisasi</p>
              )}
            </TabsContent>
          </Tabs>
          
          <Button 
            className="w-full mt-4" 
            onClick={handleSync}
            disabled={syncStatus === 'loading' || syncPlatforms.length === 0}
          >
            {syncStatus === 'loading' ? 'Sedang Sinkronisasi...' : 'Validasi & Sinkronkan Produk'}
          </Button>
        </>
      )}
    </div>
  );
};

export default ApiSyncSection;