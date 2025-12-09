import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { materials, materialDynamicPrices } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import redisClient, { ensureRedisConnection } from '@/lib/redis';

// Schemas
const DynamicPriceSchema = z.object({
  id: z.string().optional(),
  supplier: z.string().min(1, { message: 'Nama supplier tidak boleh kosong' }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga harus berupa angka positif',
  }),
});

const MaterialUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Nama material tidak boleh kosong' }).optional(),
  code: z.string().min(1, { message: 'Kode material tidak boleh kosong' }).optional(),
  unit: z.string().min(1, { message: 'Satuan harus dipilih' }).optional(),
  basePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga dasar harus berupa angka positif',
  }).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['AKTIF', 'NONAKTIF']).optional(),
  isDynamicPrice: z.boolean().optional(),
  imageUrl: z.string().url({ message: 'URL gambar tidak valid' }).optional().nullable(),
  dynamicPrices: z.array(DynamicPriceSchema).optional(),
});

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const cacheKey = `material:${id}`;

  try {
    await ensureRedisConnection();
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log(`Cache miss for key: ${cacheKey}. Fetching from DB.`);

    const material = await db.query.materials.findFirst({
      where: eq(materials.id, id),
      with: {
        dynamicPrices: true
      }
    });

    if (!material) {
      return NextResponse.json({ message: 'Material tidak ditemukan' }, { status: 404 });
    }

    // Format data
    const formattedMaterial = {
      ...material,
      initialStock: material.initialStock.toString(),
      basePrice: material.basePrice.toString(),
      dynamicPrices: material.dynamicPrices.map(dp => ({
        ...dp,
        price: dp.price.toString(),
      }))
    };

    await redisClient.set(cacheKey, JSON.stringify(formattedMaterial), { EX: 3600 });

    return NextResponse.json(formattedMaterial);
  } catch (error) {
    console.error(`Failed to fetch material ${id}:`, error);
    if (error instanceof Error && error.message.includes('Redis')) {
      return NextResponse.json({ message: 'Masalah koneksi cache, coba lagi nanti.' }, { status: 503 });
    }
    return NextResponse.json({ message: 'Gagal mengambil data material' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const cacheKey = `material:${id}`;
  const listCachePattern = 'materials:page:*'; // Check exact pattern from GET route: `materials:tenant:${tenantId}:page:*`
  // We need to invalidate tenant specific cache. We should get tenantId from material.

  try {
    await ensureRedisConnection();

    const body = await request.json();
    const validation = MaterialUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { dynamicPrices, ...materialData } = validation.data;

    // Prepare update object
    const updateData: any = { ...materialData };
    if (materialData.basePrice) {
      updateData.basePrice = parseFloat(materialData.basePrice);
    }
    // imageUrl handled implicitly

    // Fetch existing material first to verify existence and get tenantId for cache invalidation
    const existingMaterial = await db.query.materials.findFirst({
      where: eq(materials.id, id),
      columns: { tenantId: true }
    });

    if (!existingMaterial) {
      return NextResponse.json({ message: 'Material tidak ditemukan' }, { status: 404 });
    }

    const tenantId = existingMaterial.tenantId;

    // Transaction
    const updatedMaterial = await db.transaction(async (tx) => {
      // Update main fields
      const [updated] = await tx.update(materials)
        .set(updateData)
        .where(eq(materials.id, id))
        .returning();

      // Update dynamic prices
      if (materialData.isDynamicPrice === false) {
        await tx.delete(materialDynamicPrices).where(eq(materialDynamicPrices.materialId, id));
      } else if (dynamicPrices !== undefined) {
        // Delete existing and re-create
        await tx.delete(materialDynamicPrices).where(eq(materialDynamicPrices.materialId, id));
        if (dynamicPrices.length > 0) {
          await tx.insert(materialDynamicPrices).values(
            dynamicPrices.map(dp => ({
              id: crypto.randomUUID(),
              materialId: id,
              supplier: dp.supplier,
              price: parseFloat(dp.price)
            }))
          );
        }
      }

      // Fetch full object to return
      return tx.query.materials.findFirst({
        where: eq(materials.id, id),
        with: {
          dynamicPrices: true
        }
      });
    });

    if (!updatedMaterial) throw new Error("Update failed unexpectedly");

    // Invalidate caches
    await redisClient.del(cacheKey);
    // Invalidate list caches for this tenant
    const listKeys = await redisClient.keys(`materials:tenant:${tenantId}:page:*`);
    if (listKeys.length > 0) {
      await redisClient.del(listKeys);
      console.log(`Invalidated cache for ${cacheKey} and ${listKeys.length} list keys for tenant ${tenantId} after PUT.`);
    }

    // Format response
    const formattedMaterial = {
      ...updatedMaterial,
      initialStock: updatedMaterial.initialStock.toString(),
      basePrice: updatedMaterial.basePrice.toString(),
      dynamicPrices: updatedMaterial.dynamicPrices.map(dp => ({
        ...dp,
        price: dp.price.toString(),
      }))
    };

    return NextResponse.json(formattedMaterial);

  } catch (error: any) {
    console.error(`Failed to update material ${id}:`, error);
    if (error.code === '23505') { // Postgres unique violation (e.g. code)
      return NextResponse.json({ message: 'Kode material sudah digunakan.' }, { status: 409 });
    }
    if (error instanceof Error && error.message.includes('Redis')) {
      return NextResponse.json({ message: 'Masalah koneksi cache, coba lagi nanti.' }, { status: 503 });
    }
    return NextResponse.json({ message: 'Gagal memperbarui material' }, { status: 500 });
  }
}