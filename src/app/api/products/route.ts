import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import { getCurrentUser as getUser } from '@/lib/auth'; // Import getCurrentUser
import redisClient, { ensureRedisConnection } from '@/lib/redis'; // Import Redis client

const prisma = new PrismaClient();

// Pindahkan fungsi getCurrentUser ke luar handler agar bisa dipakai di GET juga
async function getCurrentUser() {
  const user = await getUser();
  if (!user || !user.id || !user.tenantId) {
    throw new Error('User tidak terautentikasi atau data user tidak lengkap.');
  }
  return user;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received product data:', body);

    // Validasi data
    if (!body.productName) {
      return NextResponse.json({ error: 'Nama produk wajib diisi' }, { status: 400 });
    }

    // Dapatkan user dari sesi login aktif
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.id || !currentUser.tenantId) {
      throw new Error('User tidak terautentikasi atau data user tidak lengkap');
    }
    
    // Simpan produk dasar
    const newProduct = await prisma.product.create({
      data: {
        name: body.productName,
        description: body.productDescription || '',
        price: body.addVariant ? 0 : parseFloat(body.defaultPrice.replace(/[.,]/g, '')),
        mainImage: body.mainImage || '',
        hasVariants: body.addVariant || false,
        // Field wajib untuk relasi dengan User
        createdBy: {
          connect: { id: currentUser.id }
        },
        // Field wajib untuk relasi dengan Tenant
        tenant: {
          connect: { id: currentUser.tenantId }
        },
        // Tambahkan field lain yang diperlukan
        sku: await generateSKU(body.productName, body.addVariant) // Generate SKU dengan format yang lebih baik
      },
    });
    
    // Jika produk tidak memiliki varian, simpan kuantitas stok ke Inventory
    // Catatan: Ini memerlukan setidaknya satu warehouse dan shelf yang tersedia
    if (!body.addVariant && body.defaultQuantity) {
      // Dapatkan warehouse default (gunakan warehouse pertama jika tersedia)
      const defaultWarehouse = await prisma.warehouse.findFirst({
        where: { tenantId: currentUser.tenantId },
        include: { shelves: { include: { area: true }, take: 1 } }
      });
      
      if (defaultWarehouse && defaultWarehouse.shelves.length > 0) {
        const defaultShelf = defaultWarehouse.shelves[0];
        
        // Simpan data inventory
        await prisma.inventory.create({
          data: {
            quantity: parseInt(body.defaultQuantity),
            productId: newProduct.id,
            shelfId: defaultShelf.id,
            warehouseId: defaultWarehouse.id
          }
        });
      } else {
        console.warn('Tidak dapat menyimpan data inventory: Warehouse atau shelf tidak tersedia');
      }
    }
    
    // Simpan ID user untuk digunakan di fungsi lain
    const userId = currentUser.id;

    /**
     * Fungsi untuk menghasilkan SKU (Stock Keeping Unit) yang unik dan terstruktur
     * Format: PRD-[3 huruf pertama nama produk]-[V jika memiliki varian]-[6 digit angka unik]
     * Contoh: PRD-BAJ-V-123456 (untuk produk "Baju" dengan varian)
     * Contoh: PRD-SEP-654321 (untuk produk "Sepatu" tanpa varian)
     */
    async function generateSKU(productName: string, hasVariant: boolean): Promise<string> {
      // Ambil 3 huruf pertama dari nama produk (uppercase) dan hilangkan karakter non-alfanumerik
      const prefix = productName
        .replace(/[^a-zA-Z0-9]/g, '') // Hapus karakter non-alfanumerik
        .substring(0, 3) // Ambil 3 karakter pertama
        .toUpperCase(); // Ubah ke uppercase
      
      // Tambahkan penanda varian jika produk memiliki varian
      const variantMarker = hasVariant ? 'V-' : '';
      
      // Generate 6 digit angka unik
      const uniqueDigits = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Cek apakah SKU sudah ada di database
      const skuCandidate = `PRD-${prefix}-${variantMarker}${uniqueDigits}`;
      const existingSKU = await prisma.product.findFirst({
        where: { sku: skuCandidate }
      });
      
      // Jika SKU sudah ada, generate ulang dengan rekursif
      if (existingSKU) {
        return generateSKU(productName, hasVariant);
      }
      
      return skuCandidate;
    }

    // Jika produk memiliki varian, simpan varian dan kombinasi
    if (body.addVariant && body.variants && body.variants.length > 0) {
      // Simpan varian
      for (const variant of body.variants) {
        if (variant.name && variant.options && variant.options.length > 0) {
          const newVariant = await prisma.productVariant.create({
            data: {
              name: variant.name,
              productId: newProduct.id,
              options: {
                create: variant.options
                  .filter(option => option.value.trim() !== '')
                  .map(option => ({
                    value: option.value,
                    image: option.image || null
                  }))
              }
            }
          });
        }
      }

      // Simpan kombinasi varian
      if (body.variantCombinations && body.variantCombinations.length > 0) {
        for (const combo of body.variantCombinations) {
          await prisma.productVariantCombination.create({
            data: {
              productId: newProduct.id,
              combinationId: combo.combinationId,
              options: combo.options,
              price: parseFloat(combo.price.replace(/[.,]/g, '')),
              quantity: parseInt(combo.quantity),
              sku: combo.sku || '',
              weight: parseFloat(combo.weight),
              weightUnit: combo.weightUnit || 'g'
            }
          });
        }
      }
    }

    console.log('Product created successfully:', newProduct);
    return NextResponse.json({ message: 'Product created successfully', product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    let errorMessage = 'Failed to create product';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET handler untuk mengambil daftar produk dengan pagination dan search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Dapatkan user saat ini untuk mendapatkan tenantId
    const currentUser = await getCurrentUser();
    const tenantId = currentUser.tenantId;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where condition for search AND tenant filtering
    const baseWhereCondition = {
      tenantId: tenantId, // Filter berdasarkan tenantId
    };

    const searchCondition = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const whereCondition = { ...baseWhereCondition, ...searchCondition };

    // Fetch products with pagination and search
    const productsRaw = await prisma.product.findMany({
      select: { // Tambahkan select untuk memilih field secara eksplisit
        id: true,
        name: true,
        description: true,
        sku: true,
        price: true,
        cost: true,
        minStockLevel: true,
        weight: true,
        weightUnit: true,
        packageLength: true,
        packageWidth: true,
        packageHeight: true,
        isPreorder: true,
        preorderDays: true,
        purchaseLimit: true,
        hasVariants: true,
        mainImage: true, // Sertakan mainImage
        createdAt: true,
        updatedAt: true,
        createdById: true,
        categoryId: true,
        tenantId: true,
        // Relasi yang diperlukan untuk perhitungan
        variants: {
          select: { id: true }
        },
        inventories: {
          select: { quantity: true }
        }
      },
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: 'desc', // Default sort by creation date
      },
      // include dihapus karena sudah menggunakan select
    });

    // Get total count for pagination
    const totalProducts = await prisma.product.count({
      where: whereCondition,
    });

    // Process products to add total stock, price range, and variant combinations
    const products = await Promise.all(productsRaw.map(async (product) => {
      let totalStock = 0;
      let minVariantPrice: number | null = null;
      let maxVariantPrice: number | null = null;
      let combinations: any[] = []; // Initialize combinations array

      if (product.hasVariants) {
        // --- Redis Cache Check ---
        const cacheKey = `product:${product.id}:combinations`;
        let cachedCombinations: string | null = null;
        try {
          await ensureRedisConnection();
          cachedCombinations = await redisClient.get(cacheKey);
        } catch (redisError) {
          console.warn(`Redis GET error for key ${cacheKey}:`, redisError);
        }

        if (cachedCombinations) {
          try {
            combinations = JSON.parse(cachedCombinations);
            console.log(`Cache hit for ${cacheKey}`);
          } catch (parseError) {
            console.error(`Error parsing cached combinations for ${cacheKey}:`, parseError);
            // Fallback to DB fetch if cache is corrupted
            cachedCombinations = null; // Ensure DB fetch happens
          }
        }
        
        if (!cachedCombinations) {
          console.log(`Cache miss for ${cacheKey}, fetching from DB...`);
          // Fetch combinations specifically for this product from DB
          combinations = await prisma.productVariantCombination.findMany({
            where: { productId: product.id },
            select: { 
              id: true, // Select necessary fields
              combinationId: true,
              options: true,
              price: true, 
              quantity: true,
              sku: true,
              weight: true,
              weightUnit: true,
              createdAt: true,
              updatedAt: true
            },
          });
          // Store in Redis with 5-minute expiry
          try {
            await redisClient.set(cacheKey, JSON.stringify(combinations), { EX: 300 });
          } catch (redisSetError) {
            console.warn(`Redis SET error for key ${cacheKey}:`, redisSetError);
          }
        }
        // --- End Redis Cache Logic ---

        // Calculate stock and price range from fetched/cached combinations
        totalStock = combinations.reduce((sum, combo) => sum + (combo.quantity || 0), 0);

        if (combinations.length > 0) {
          const prices = combinations.map(c => c.price);
          minVariantPrice = Math.min(...prices);
          maxVariantPrice = Math.max(...prices);
        }
      } else {
        // Sum stock from inventory entries for non-variant product
        totalStock = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0); // Ganti 'inventory' menjadi 'inventories'
      }

      return {
        ...product,
        mainImage: product.mainImage, // Pastikan mainImage disertakan secara eksplisit
        totalStock,
        variantCount: product.variants.length, // Add variant count
        minVariantPrice, // Add min variant price
        maxVariantPrice, // Add max variant price
        combinations: product.hasVariants ? combinations : undefined, // Include combinations if product has variants
        // Hapus relasi yang tidak perlu lagi setelah perhitungan
        variants: undefined,
        inventories: undefined,
      };
    }));


    return NextResponse.json({
      data: products,
      total: totalProducts,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    let errorMessage = 'Failed to fetch products';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}