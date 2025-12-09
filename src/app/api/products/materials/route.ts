import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { materials, materialDynamicPrices, categories, materialStockBatches } from '@/lib/db/schema';
import { eq, and, inArray, count, desc } from 'drizzle-orm';
import { z } from 'zod';
import redisClient, { ensureRedisConnection } from '@/lib/redis';

// Zod schema for validation
const DynamicPriceSchema = z.object({
  supplier: z.string().min(1, { message: 'Nama supplier tidak boleh kosong' }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga harus berupa angka positif',
  }),
});

// Assuming MaterialStatus enum values
const MaterialStatusEnum = {
  AKTIF: 'AKTIF',
  NONAKTIF: 'NONAKTIF'
} as const;

const MaterialSchema = z.object({
  name: z.string().min(1, { message: 'Nama material tidak boleh kosong' }),
  code: z.string().min(1, { message: 'Kode material tidak boleh kosong' }),
  unit: z.string().min(1, { message: 'Satuan harus dipilih' }),
  initialStock: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Stok awal harus berupa angka positif',
  }),
  minStockLevel: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Minimal stok harus berupa angka positif',
  }),
  basePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga dasar harus berupa angka positif',
  }),
  description: z.string().optional(),
  status: z.enum([MaterialStatusEnum.AKTIF, MaterialStatusEnum.NONAKTIF]),
  isDynamicPrice: z.boolean(),
  imageUrl: z.string().optional(),
  categoryId: z.string().min(1, { message: 'Kategori harus dipilih' }),
  warehouseId: z.string().optional(),
  dynamicPrices: z.array(DynamicPriceSchema).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await ensureRedisConnection();

    const tenantId = request.headers.get('X-Tenant-Id');

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID not found in headers' }, { status: 400 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const cacheKey = `materials:tenant:${tenantId}:page:${page}:limit:${limit}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log(`Cache miss for key: ${cacheKey}. Fetching from DB.`);

    // Fetch materials with category
    const materialsData = await db.query.materials.findMany({
      where: (materials, { eq }) => eq(materials.tenantId, tenantId),
      orderBy: [desc(materials.createdAt)],
      limit: limit,
      offset: skip,
      with: {
        category: {
          columns: {
            id: true,
            name: true
          }
        }
      }
    });

    const [countResult] = await db.select({ count: count() })
      .from(materials)
      .where(eq(materials.tenantId, tenantId));

    const totalMaterials = countResult ? countResult.count : 0;

    const formattedMaterials = materialsData.map(material => ({
      id: material.id,
      name: material.name,
      code: material.code,
      unit: material.unit,
      stock: material.initialStock,
      minStockLevel: material.minStockLevel,
      basePrice: material.basePrice,
      status: material.status,
      createdAt: material.createdAt.toISOString(),
      imageUrl: material.imageUrl,
      categoryId: material.categoryId,
      category: material.category ? material.category.name : null,
    }));

    const totalPages = Math.ceil(totalMaterials / limit);

    const responseData = {
      data: formattedMaterials,
      pagination: {
        page,
        limit,
        totalItems: totalMaterials,
        totalPages,
      }
    };

    await redisClient.set(cacheKey, JSON.stringify(responseData), {
      EX: 3600,
    });
    console.log(`Cache set for key: ${cacheKey}`);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Failed to fetch materials:', error);
    if (error instanceof Error && error.message.includes('Redis')) {
      return NextResponse.json({ message: 'Masalah koneksi cache, coba lagi nanti.' }, { status: 503 });
    }
    return NextResponse.json({ message: 'Gagal mengambil data material' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    await ensureRedisConnection();

    const tenantId = request.headers.get('X-Tenant-Id');

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID not found in headers' }, { status: 400 });
    }

    const body = await request.json();
    const validation = MaterialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { dynamicPrices, ...materialData } = validation.data;

    const initialStockNumber = parseInt(materialData.initialStock, 10);
    const basePriceNumber = parseFloat(materialData.basePrice);
    const minStockLevelNumber = parseInt(materialData.minStockLevel, 10);

    // Validate warehouseId if initialStock > 0
    if (initialStockNumber > 0 && !materialData.warehouseId) {
      return NextResponse.json({ message: 'Pilih gudang untuk stok awal.' }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      // Create material
      const [newMaterial] = await tx.insert(materials).values({
        id: crypto.randomUUID(),
        name: materialData.name,
        code: materialData.code,
        unit: materialData.unit,
        initialStock: initialStockNumber,
        minStockLevel: minStockLevelNumber,
        basePrice: basePriceNumber,
        description: materialData.description,
        status: materialData.status,
        isDynamicPrice: materialData.isDynamicPrice,
        imageUrl: materialData.imageUrl,
        categoryId: materialData.categoryId,
        tenantId: tenantId
      }).returning();

      // Create dynamic prices
      if (materialData.isDynamicPrice && dynamicPrices && dynamicPrices.length > 0) {
        await tx.insert(materialDynamicPrices).values(
          dynamicPrices.map(dp => ({
            id: crypto.randomUUID(),
            materialId: newMaterial.id,
            supplier: dp.supplier,
            price: parseFloat(dp.price)
          }))
        );
      }

      // Create Material Stock Batch if initial stock > 0
      if (initialStockNumber > 0 && materialData.warehouseId) {
        const batchCode = `BATCH-${Date.now()}`; // Simple batch code generation

        await tx.insert(materialStockBatches).values({
          id: crypto.randomUUID(),
          materialId: newMaterial.id,
          batchCode: batchCode,
          qtyTotal: initialStockNumber,
          qtyRemaining: initialStockNumber,
          costPerUnit: basePriceNumber,
          receivedAt: new Date(),
          warehouseId: materialData.warehouseId,
        });
      }

      // Return full material with prices for response consistency
      // Note: Drizzle insert returning doesn't include relations. 
      // We can fetch it back or construct it.
      // Constructing it is cheaper.
      return {
        ...newMaterial,
        dynamicPrices: materialData.isDynamicPrice && dynamicPrices ? dynamicPrices : []
      };
    });

    // Invalidate cache
    const keys = await redisClient.keys(`materials:tenant:${tenantId}:page:*`);
    if (keys.length > 0) {
      console.log(`Invalidating cache keys for tenant ${tenantId}:`, keys);
      await redisClient.del(keys);
      console.log(`Cache invalidated for tenant ${tenantId}.`);
    }

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Failed to create material:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') { // Prisma P2002 code check is invalid for Drizzle error usually
      // Drizzle/Postgres error code for unique violation is 23505
      // But error object structure depends on driver (node-postgres)
      // Assuming generic error message or checking properties if available
      return NextResponse.json({ message: 'Kode material mungkin sudah digunakan.' }, { status: 409 });
    }
    // Check for postgres unique constraint error
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === '23505') {
      return NextResponse.json({ message: 'Kode material sudah digunakan.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Gagal membuat material baru.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureRedisConnection();

    const tenantId = request.headers.get('X-Tenant-Id');

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID not found in headers' }, { status: 400 });
    }

    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ message: 'Parameter IDs diperlukan' }, { status: 400 });
    }

    const idsToDelete = idsParam.split(',');

    if (idsToDelete.length === 0) {
      return NextResponse.json({ message: 'Tidak ada ID yang diberikan untuk dihapus' }, { status: 400 });
    }

    const deleteResult = await db.delete(materials)
      .where(
        and(
          inArray(materials.id, idsToDelete),
          eq(materials.tenantId, tenantId)
        )
      )
      .returning();

    if (deleteResult.length === 0) {
      return NextResponse.json({ message: 'Tidak ada material yang ditemukan dengan ID yang diberikan' }, { status: 404 });
    }

    const keys = await redisClient.keys(`materials:tenant:${tenantId}:page:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} material cache keys for tenant ${tenantId} after DELETE.`);
    }

    return NextResponse.json({ message: `${deleteResult.length} material berhasil dihapus` }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete materials:', error);
    return NextResponse.json({ message: 'Gagal menghapus material' }, { status: 500 });
  }
}