import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, MaterialStatus } from '@prisma/client';
import { z } from 'zod';
import redisClient, { ensureRedisConnection } from '@/lib/redis'; // Import Redis client and connection helper

const prisma = new PrismaClient();

// Zod schema for validation
const DynamicPriceSchema = z.object({
  supplier: z.string().min(1, { message: 'Nama supplier tidak boleh kosong' }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga harus berupa angka positif',
  }),
});

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
  status: z.enum([MaterialStatus.AKTIF, MaterialStatus.NONAKTIF]),
  isDynamicPrice: z.boolean(),
  imageUrl: z.string().optional(), // Tambahkan validasi untuk imageUrl
  categoryId: z.string().min(1, { message: 'Kategori harus dipilih' }),
  dynamicPrices: z.array(DynamicPriceSchema).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await ensureRedisConnection(); // Pastikan koneksi Redis aktif

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Buat kunci cache yang unik berdasarkan halaman dan batas
    const cacheKey = `materials:page:${page}:limit:${limit}`;

    // Coba ambil data dari cache Redis
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      // Jika data ada di cache, parse dan kembalikan
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log(`Cache miss for key: ${cacheKey}. Fetching from DB.`);
    // Jika data tidak ada di cache, ambil dari database
    const [materials, totalMaterials] = await prisma.$transaction([
      prisma.material.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          unit: true,
          initialStock: true,
          minStockLevel: true, // Tambahkan minStockLevel
          basePrice: true, // Tambahkan basePrice untuk estimasi harga
          status: true,
          createdAt: true,
          imageUrl: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.material.count(),
    ]);

    // Format data dengan menambahkan basePrice untuk estimasi harga dan kategori
    const formattedMaterials = materials.map(material => ({
        id: material.id,
        name: material.name,
        code: material.code,
        unit: material.unit,
        stock: material.initialStock,
        minStockLevel: material.minStockLevel, // Tambahkan minStockLevel
        basePrice: material.basePrice, // Tambahkan basePrice untuk estimasi harga
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

    // Simpan data ke cache Redis dengan waktu kedaluwarsa (misal: 1 jam)
    await redisClient.set(cacheKey, JSON.stringify(responseData), {
      EX: 3600, // Kedaluwarsa dalam 1 jam (3600 detik)
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Failed to fetch materials:', error);
    // Jika error berasal dari Redis, mungkin log secara berbeda
    if (error instanceof Error && error.message.includes('Redis')) {
        return NextResponse.json({ message: 'Masalah koneksi cache, coba lagi nanti.' }, { status: 503 }); // Service Unavailable
    }
    return NextResponse.json({ message: 'Gagal mengambil data material' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    await ensureRedisConnection(); // Pastikan koneksi Redis aktif

    const body = await request.json();
    const validation = MaterialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { dynamicPrices, ...materialData } = validation.data;

    // Convert string numbers to actual numbers
    const initialStockNumber = parseInt(materialData.initialStock, 10);
    const basePriceNumber = parseFloat(materialData.basePrice);

    // Ensure imageUrl is included in the data
    const newMaterial = await prisma.material.create({
      data: {
        ...materialData,
        initialStock: initialStockNumber,
        basePrice: basePriceNumber,
        // imageUrl is already included in materialData from validation.data
        dynamicPrices: materialData.isDynamicPrice && dynamicPrices && dynamicPrices.length > 0
          ? {
              create: dynamicPrices.map(dp => ({
                supplier: dp.supplier,
                price: parseFloat(dp.price),
              })),
            }
          : undefined,
      },
      include: {
        dynamicPrices: true, // Include dynamic prices in the response
      },
    });

    // Invalidate cache setelah membuat material baru
    // Cara sederhana: hapus semua cache terkait material (bisa dioptimalkan)
    const keys = await redisClient.keys('materials:page:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} material cache keys after POST.`);
    }

    return NextResponse.json(newMaterial, { status: 201 });

  } catch (error) {
    console.error('Failed to create material:', error);
    // Check for unique constraint violation (code)
    if (error instanceof Error && 'code' in error && error.code === 'P2002' && 'meta' in error && error.meta?.target?.includes('code')) {
        return NextResponse.json({ message: 'Kode material sudah digunakan.' }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Gagal membuat material baru.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureRedisConnection(); // Pastikan koneksi Redis aktif

    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ message: 'Parameter IDs diperlukan' }, { status: 400 });
    }

    const idsToDelete = idsParam.split(',');

    if (idsToDelete.length === 0) {
      return NextResponse.json({ message: 'Tidak ada ID yang diberikan untuk dihapus' }, { status: 400 });
    }

    // Validate that all IDs are valid (optional but recommended)
    // For simplicity, we assume IDs are valid UUIDs or CUIDs as per Prisma schema

    const deleteResult = await prisma.material.deleteMany({
      where: {
        id: {
          in: idsToDelete,
        },
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ message: 'Tidak ada material yang ditemukan dengan ID yang diberikan' }, { status: 404 });
    }

    // Invalidate cache setelah menghapus material
    const keys = await redisClient.keys('materials:page:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} material cache keys after DELETE.`);
    }

    return NextResponse.json({ message: `${deleteResult.count} material berhasil dihapus` }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete materials:', error);
    // Handle potential errors, e.g., foreign key constraints if materials are linked elsewhere
    return NextResponse.json({ message: 'Gagal menghapus material' }, { status: 500 });
  }
}