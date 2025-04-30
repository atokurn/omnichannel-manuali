import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, MaterialStatus } from '@prisma/client';
import { z } from 'zod';
import redisClient, { ensureRedisConnection } from '@/lib/redis'; // Import Redis client

const prisma = new PrismaClient();

// Re-use or define validation schemas if needed for PUT/PATCH
const DynamicPriceSchema = z.object({
  id: z.string().optional(), // Optional for updates, required for linking existing
  supplier: z.string().min(1, { message: 'Nama supplier tidak boleh kosong' }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga harus berupa angka positif',
  }),
});

const MaterialUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Nama material tidak boleh kosong' }).optional(),
  code: z.string().min(1, { message: 'Kode material tidak boleh kosong' }).optional(), // Consider if code should be updatable
  unit: z.string().min(1, { message: 'Satuan harus dipilih' }).optional(),
  // initialStock might not be directly updatable, handle stock changes via transactions/adjustments
  basePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga dasar harus berupa angka positif',
  }).optional(),
  description: z.string().optional().nullable(),
  status: z.enum([MaterialStatus.AKTIF, MaterialStatus.NONAKTIF]).optional(),
  isDynamicPrice: z.boolean().optional(),
  imageUrl: z.string().url({ message: 'URL gambar tidak valid' }).optional().nullable(), // Add imageUrl validation
  dynamicPrices: z.array(DynamicPriceSchema).optional(),
});

// GET handler to fetch a single material by ID
// Correctly destructure params directly in the function signature
export async function GET(request: NextRequest, { params: { id } }: { params: { id: string } }) {
  // const { id } = params; // No longer needed, id is directly available
  const cacheKey = `material:${id}`;

  try {
    await ensureRedisConnection();
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log(`Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        dynamicPrices: true, // Include dynamic prices if needed for view/edit
      },
    });

    if (!material) {
      return NextResponse.json({ message: 'Material tidak ditemukan' }, { status: 404 });
    }

    // Format data if necessary (e.g., numbers to strings for form)
    const formattedMaterial = {
        ...material,
        initialStock: material.initialStock.toString(),
        basePrice: material.basePrice.toString(),
        dynamicPrices: material.dynamicPrices.map(dp => ({
            ...dp,
            price: dp.price.toString(),
        }))
    };

    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(formattedMaterial), { EX: 3600 }); // Cache for 1 hour

    return NextResponse.json(formattedMaterial);
  } catch (error) {
    console.error(`Failed to fetch material ${id}:`, error);
    if (error instanceof Error && error.message.includes('Redis')) {
        return NextResponse.json({ message: 'Masalah koneksi cache, coba lagi nanti.' }, { status: 503 });
    }
    return NextResponse.json({ message: 'Gagal mengambil data material' }, { status: 500 });
  }
}

// PUT handler to update a material by ID
// Correctly destructure params directly in the function signature
export async function PUT(request: NextRequest, { params: { id } }: { params: { id: string } }) {
  // const { id } = params; // No longer needed, id is directly available
  const cacheKey = `material:${id}`;
  const listCachePattern = 'materials:page:*'; // Pattern for list caches

  try {
    await ensureRedisConnection();

    const body = await request.json();
    const validation = MaterialUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { dynamicPrices, ...materialData } = validation.data;

    // Convert numbers back if necessary
    const updateData: any = { ...materialData };
    if (materialData.basePrice) {
      updateData.basePrice = parseFloat(materialData.basePrice);
    }
    // Handle imageUrl: allow setting to null or a valid URL
    if ('imageUrl' in materialData) {
        updateData.imageUrl = materialData.imageUrl; // Already validated as string/URL or null
    }

    // Note: initialStock is generally not updated directly here.
    // Stock adjustments should likely happen through separate inventory transaction logic.

    // Handle dynamic prices update (more complex logic might be needed for adds/updates/deletes)
    // This is a simplified example: replacing all dynamic prices
    const dynamicPriceOperations: any = {};
    if (materialData.isDynamicPrice === false) {
        // If dynamic price is turned off, delete existing ones
        dynamicPriceOperations.deleteMany = {};
    } else if (dynamicPrices !== undefined) {
        // If dynamic price is on and prices are provided, update/create
        // Simple approach: delete existing and create new ones
        dynamicPriceOperations.deleteMany = {};
        dynamicPriceOperations.create = dynamicPrices.map(dp => ({
            supplier: dp.supplier,
            price: parseFloat(dp.price),
        }));
        // A more robust approach would involve checking existing IDs and performing upserts/deletes selectively.
    }

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        ...updateData,
        dynamicPrices: Object.keys(dynamicPriceOperations).length > 0 ? dynamicPriceOperations : undefined,
      },
      include: {
        dynamicPrices: true,
      },
    });

    // Invalidate specific material cache and list caches
    await redisClient.del(cacheKey);
    const keys = await redisClient.keys(listCachePattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated cache for ${cacheKey} and ${keys.length} list keys after PUT.`);
    }

    // Format response data if necessary (similar to GET)
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
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ message: 'Material tidak ditemukan' }, { status: 404 });
    }
    // Check for unique constraint violation (code) - if code is updatable
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        return NextResponse.json({ message: 'Kode material sudah digunakan.' }, { status: 409 }); // Conflict
    }
    if (error instanceof Error && error.message.includes('Redis')) {
        return NextResponse.json({ message: 'Masalah koneksi cache, coba lagi nanti.' }, { status: 503 });
    }
    return NextResponse.json({ message: 'Gagal memperbarui material' }, { status: 500 });
  }
}