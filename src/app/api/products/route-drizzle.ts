import { NextResponse } from 'next/server';
import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';

import { getCurrentUser as getUser } from '@/lib/auth'; // Import getCurrentUser
import { db } from '@/lib/db'; // Import Drizzle instance
import * as schema from '@/lib/db/schema'; // Import schema
import { getRedisClient } from '@/lib/db'; // Import Redis client
import { ensureRedisConnection } from '@/lib/redis'; // Import Redis connection helper

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
    
    // Generate SKU
    const sku = await generateSKU(body.productName, body.addVariant || false);
    
    // Simpan produk dasar menggunakan Drizzle
    const [newProduct] = await db.insert(schema.products).values({
      name: body.productName,
      description: body.productDescription || '',
      price: body.addVariant ? 0 : parseFloat(body.defaultPrice.replace(/[.,]/g, '')),
      mainImage: body.mainImage || '',
      hasVariants: body.addVariant || false,
      tenantId: currentUser.tenantId,
      createdById: currentUser.id,
      sku: sku
    }).returning();
    
    // Jika produk tidak memiliki varian, simpan kuantitas stok ke Inventory
    if (!body.addVariant && body.defaultQuantity) {
      // Dapatkan warehouse default (gunakan warehouse pertama jika tersedia)
      const defaultWarehouses = await db.select().from(schema.warehouses)
        .where(eq(schema.warehouses.tenantId, currentUser.tenantId))
        .limit(1);
      
      if (defaultWarehouses.length > 0) {
        const defaultWarehouse = defaultWarehouses[0];
        
        // Dapatkan shelf default
        const defaultShelves = await db.select()
          .from(schema.shelves)
          .where(eq(schema.shelves.warehouseId, defaultWarehouse.id))
          .limit(1);
        
        if (defaultShelves.length > 0) {
          const defaultShelf = defaultShelves[0];
          
          // Simpan data inventory menggunakan Drizzle
          await db.insert(schema.inventory).values({
            quantity: parseInt(body.defaultQuantity),
            productId: newProduct.id,
            shelfId: defaultShelf.id,
            warehouseId: defaultWarehouse.id
          });
        } else {
          console.warn('Tidak dapat menyimpan data inventory: Shelf tidak tersedia');
        }
      } else {
        console.warn('Tidak dapat menyimpan data inventory: Warehouse tidak tersedia');
      }
    }
    
    // Simpan ID user untuk digunakan di fungsi lain
    const userId = currentUser.id;

    // Jika produk memiliki varian, simpan varian dan kombinasi
    if (body.addVariant && body.variants && body.variants.length > 0) {
      // Simpan varian
      for (const variant of body.variants) {
        if (variant.name && variant.options && variant.options.length > 0) {
          const [newVariant] = await db.insert(schema.productVariants).values({
            name: variant.name,
            productId: newProduct.id
          }).returning();
          
          // Simpan opsi varian
          for (const option of variant.options) {
            if (option.value.trim() !== '') {
              await db.insert(schema.productVariantOptions).values({
                value: option.value,
                image: option.image || null,
                variantId: newVariant.id
              });
            }
          }
        }
      }

      // Simpan kombinasi varian
      if (body.variantCombinations && body.variantCombinations.length > 0) {
        for (const combo of body.variantCombinations) {
          await db.insert(schema.productVariantCombinations).values({
            productId: newProduct.id,
            combinationId: combo.combinationId,
            options: combo.options,
            price: parseFloat(combo.price.replace(/[.,]/g, '')),
            quantity: parseInt(combo.quantity),
            sku: combo.sku || '',
            weight: parseFloat(combo.weight),
            weightUnit: combo.weightUnit || 'g'
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
  
  // Cek apakah SKU sudah ada di database menggunakan Drizzle
  const skuCandidate = `PRD-${prefix}-${variantMarker}${uniqueDigits}`;
  const existingSKU = await db.select().from(schema.products).where(eq(schema.products.sku, skuCandidate)).limit(1);
  
  // Jika SKU sudah ada, generate ulang dengan rekursif
  if (existingSKU.length > 0) {
    return generateSKU(productName, hasVariant);
  }
  
  return skuCandidate;
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

    // Build where condition for search AND tenant filtering using Drizzle
    let whereConditions = eq(schema.products.tenantId, tenantId);

    // Add search condition if search term is provided
    if (search) {
      whereConditions = and(
        whereConditions,
        or(
          ilike(schema.products.name, `%${search}%`),
          ilike(schema.products.sku || '', `%${search}%`),
          ilike(schema.products.description || '', `%${search}%`)
        )
      );
    }

    // Fetch products with pagination and search using Drizzle
    const productsRaw = await db.select({
      id: schema.products.id,
      name: schema.products.name,
      description: schema.products.description,
      sku: schema.products.sku,
      price: schema.products.price,
      cost: schema.products.cost,
      minStockLevel: schema.products.minStockLevel,
      weight: schema.products.weight,
      weightUnit: schema.products.weightUnit,
      packageLength: schema.products.packageLength,
      packageWidth: schema.products.packageWidth,
      packageHeight: schema.products.packageHeight,
      isPreorder: schema.products.isPreorder,
      preorderDays: schema.products.preorderDays,
      purchaseLimit: schema.products.purchaseLimit,
      hasVariants: schema.products.hasVariants,
      mainImage: schema.products.mainImage,
      createdAt: schema.products.createdAt,
      updatedAt: schema.products.updatedAt,
      createdById: schema.products.createdById,
      categoryId: schema.products.categoryId,
      tenantId: schema.products.tenantId,
    })
    .from(schema.products)
    .where(whereConditions)
    .limit(limit)
    .offset(skip)
    .orderBy(desc(schema.products.createdAt));

    // Get total count for pagination using Drizzle
    const totalProductsResult = await db.select({ count: db.fn.count() })
      .from(schema.products)
      .where(whereConditions);
    const totalProducts = Number(totalProductsResult[0].count);

    // Process products to add total stock, price range, and variant combinations
    const products = await Promise.all(productsRaw.map(async (product) => {
      let totalStock = 0;
      let minVariantPrice: number | null = null;
      let maxVariantPrice: number | null = null;
      let processedCombinations: any[] = [];

      if (product.hasVariants) {
        const cacheKey = `product:${product.id}:combinations_with_imageUrl_v1`; // New cache key
        let cachedDataString: string | null = null;
        try {
          await ensureRedisConnection();
          const redisClient = await getRedisClient();
          cachedDataString = await redisClient.get(cacheKey);
        } catch (redisError) {
          console.warn(`Redis GET error for key ${cacheKey}:`, redisError);
        }

        if (cachedDataString) {
          try {
            processedCombinations = JSON.parse(cachedDataString);
            console.log(`Cache hit for ${cacheKey}`);
          } catch (parseError) {
            console.error(`Error parsing cached data for ${cacheKey}:`, parseError);
            cachedDataString = null; // Force DB fetch if cache is corrupted
          }
        }
        
        if (!cachedDataString) { // If cache miss or parse error
          console.log(`Cache miss or parse error for ${cacheKey}, fetching and processing...`);
          // Fetch raw combinations specifically for this product from DB using Drizzle
          const rawCombinations = await db.select({
            id: schema.productVariantCombinations.id,
            combinationId: schema.productVariantCombinations.combinationId,
            options: schema.productVariantCombinations.options,
            price: schema.productVariantCombinations.price,
            quantity: schema.productVariantCombinations.quantity,
            sku: schema.productVariantCombinations.sku,
            weight: schema.productVariantCombinations.weight,
            weightUnit: schema.productVariantCombinations.weightUnit,
            createdAt: schema.productVariantCombinations.createdAt,
            updatedAt: schema.productVariantCombinations.updatedAt
          })
          .from(schema.productVariantCombinations)
          .where(eq(schema.productVariantCombinations.productId, product.id));

          // Fetch all ProductVariantOptions with images for this product using Drizzle
          const productVariantOptionsWithImages = await db.select({
            value: schema.productVariantOptions.value,
            image: schema.productVariantOptions.image,
            variantName: schema.productVariants.name
          })
          .from(schema.productVariantOptions)
          .innerJoin(
            schema.productVariants,
            eq(schema.productVariantOptions.variantId, schema.productVariants.id)
          )
          .where(
            and(
              eq(schema.productVariants.productId, product.id),
              // Only options with images
              // Note: In Drizzle, we need to handle null differently
              // This is a simplified version, might need adjustment
              or(
                eq(schema.productVariantOptions.image, null),
                ilike(schema.productVariantOptions.image, '%')
              )
            )
          );

          // Helper function to find a representative image for a combination
          const findRepresentativeImage = (
            comboOpts: Record<string, string>,
            allOptsWithImgs: Array<{value: string, image: string | null, variantName: string}>
          ): string | null => {
            for (const variantNameKey in comboOpts) {
              const optionVal = comboOpts[variantNameKey];
              const foundOpt = allOptsWithImgs.find(
                opt => opt.variantName === variantNameKey && opt.value === optionVal && opt.image
              );
              if (foundOpt && foundOpt.image) {
                return foundOpt.image;
              }
            }
            return null;
          };

          // Process rawCombinations to add imageUrl
          processedCombinations = rawCombinations.map(combo => ({
            ...combo,
            imageUrl: findRepresentativeImage(combo.options as Record<string, string>, productVariantOptionsWithImages),
          }));
          
          // Store processedCombinations in Redis
          try {
            const redisClient = await getRedisClient();
            await redisClient.set(cacheKey, JSON.stringify(processedCombinations), { EX: 300 }); // Cache for 5 minutes
          } catch (redisSetError) {
            console.warn(`Redis SET error for key ${cacheKey}:`, redisSetError);
          }
        }

        // Calculate stock and price range from processedCombinations
        totalStock = processedCombinations.reduce((sum, combo) => sum + (combo.quantity || 0), 0);

        if (processedCombinations.length > 0) {
          const prices = processedCombinations.map(c => c.price);
          minVariantPrice = Math.min(...prices);
          maxVariantPrice = Math.max(...prices);
        }
      } else {
        // Sum stock from inventory entries for non-variant product using Drizzle
        const inventories = await db.select({ quantity: schema.inventory.quantity })
          .from(schema.inventory)
          .where(eq(schema.inventory.productId, product.id));
        
        totalStock = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
      }

      // Get variant count using Drizzle
      const variantCount = await db.select({ count: db.fn.count() })
        .from(schema.productVariants)
        .where(eq(schema.productVariants.productId, product.id));

      return {
        ...product,
        mainImage: product.mainImage, // Pastikan mainImage disertakan secara eksplisit
        totalStock,
        variantCount: Number(variantCount[0].count), // Add variant count
        minVariantPrice, // Add min variant price
        maxVariantPrice, // Add max variant price
        combinations: product.hasVariants ? processedCombinations : undefined, // Include processedCombinations (with imageUrl)
      };
    }));

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        totalItems: totalProducts,
        totalPages: Math.ceil(totalProducts / limit)
      }
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