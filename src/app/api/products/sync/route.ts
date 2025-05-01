import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { ecommerceSyncService } from '@/lib/services/ecommerce-sync-service';
import { SyncStatus } from '@prisma/client';

// Schema validasi untuk request sinkronisasi produk
const ProductSyncSchema = z.object({
  productId: z.string().uuid({ message: 'Product ID harus berupa UUID yang valid' }),
  platformIds: z.array(z.string().uuid({ message: 'Platform ID harus berupa UUID yang valid' })),
  storeIds: z.array(z.string().uuid({ message: 'Store ID harus berupa UUID yang valid' })).optional(),
  syncAll: z.boolean().optional().default(false),
  fieldValues: z.record(z.string()).optional(),
});

/**
 * POST /api/products/sync
 * Endpoint untuk memulai sinkronisasi produk ke platform e-commerce
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ProductSyncSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { productId, platformIds, storeIds, syncAll, fieldValues } = validation.data;

    // Simpan nilai field kustom jika ada
    if (fieldValues && Object.keys(fieldValues).length > 0) {
      for (const platformId of platformIds) {
        const productMapping = await ecommerceSyncService.upsertProductMapping(productId, platformId);
        
        for (const [fieldName, fieldValue] of Object.entries(fieldValues)) {
          await ecommerceSyncService.saveProductFieldValue(
            productMapping.id,
            fieldName,
            String(fieldValue)
          );
        }
      }
    }

    // Jalankan sinkronisasi
    const syncResults = [];

    if (syncAll) {
      // Sinkronisasi ke semua platform tanpa store spesifik
      for (const platformId of platformIds) {
        const result = await ecommerceSyncService.syncProductToPlatform(productId, platformId);
        syncResults.push({
          platformId,
          ...result
        });
      }
    } else if (storeIds && storeIds.length > 0) {
      // Sinkronisasi ke store spesifik
      for (const platformId of platformIds) {
        for (const storeId of storeIds) {
          const result = await ecommerceSyncService.syncProductToPlatform(productId, platformId, storeId);
          syncResults.push({
            platformId,
            storeId,
            ...result
          });
        }
      }
    } else {
      // Sinkronisasi ke platform tanpa store spesifik
      for (const platformId of platformIds) {
        const result = await ecommerceSyncService.syncProductToPlatform(productId, platformId);
        syncResults.push({
          platformId,
          ...result
        });
      }
    }

    return NextResponse.json({
      success: syncResults.every(result => result.success),
      results: syncResults
    });
  } catch (error) {
    console.error('Failed to sync product:', error);
    return NextResponse.json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Terjadi kesalahan saat sinkronisasi produk' 
    }, { status: 500 });
  }
}

/**
 * GET /api/products/sync?productId=xxx
 * Endpoint untuk mendapatkan status sinkronisasi produk
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ message: 'Product ID diperlukan' }, { status: 400 });
    }

    // Ambil semua mapping produk untuk produk ini
    const productMappings = await prisma.productMapping.findMany({
      where: { productId },
      include: {
        platform: true,
        store: true,
        fieldValues: true
      }
    });

    // Ambil log sinkronisasi terbaru
    const syncLogs = await prisma.syncLog.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      productId,
      mappings: productMappings,
      syncLogs
    });
  } catch (error) {
    console.error('Failed to get sync status:', error);
    return NextResponse.json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil status sinkronisasi' 
    }, { status: 500 });
  }
}

/**
 * Inisialisasi Prisma client
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();