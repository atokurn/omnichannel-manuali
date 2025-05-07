import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser as getUser } from '@/lib/auth';
import redisClient, { ensureRedisConnection } from '@/lib/redis';

const prisma = new PrismaClient();

// Helper function to get current user, ensuring tenant context
async function getCurrentUser() {
  const user = await getUser();
  if (!user || !user.id || !user.tenantId) {
    console.error('Authentication error: User not authenticated or tenantId missing.');
    throw new Error('User tidak terautentikasi atau data user tidak lengkap.');
  }
  return user;
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const productId = params.productId;

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    const currentUser = await getCurrentUser();
    const tenantId = currentUser.tenantId;

    // Check if the product exists and belongs to the current tenant
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        tenantId: tenantId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.' }, { status: 404 });
    }

    // Perform deletion
    // Note: Consider related data that needs to be deleted or handled (e.g., variants, inventory, etc.)
    // This is a basic deletion. For a real-world scenario, you'd likely need a transaction
    // and more complex logic to handle related entities.

    // 1. Delete ProductVariantCombinations
    await prisma.productVariantCombination.deleteMany({
      where: { productId: productId },
    });

    // 2. Delete ProductVariantOptions (if they are exclusively linked to variants of this product)
    // This might be more complex if options can be shared. For simplicity, assuming direct relation.
    const variants = await prisma.productVariant.findMany({
      where: { productId: productId },
      select: { id: true },
    });
    const variantIds = variants.map(v => v.id);
    await prisma.productVariantOption.deleteMany({
      where: { variantId: { in: variantIds } },
    });

    // 3. Delete ProductVariants
    await prisma.productVariant.deleteMany({
      where: { productId: productId },
    });

    // 4. Delete Inventory records
    await prisma.inventory.deleteMany({
        where: { productId: productId },
    });

    // 5. Delete the Product itself
    await prisma.product.delete({
      where: { id: productId },
    });

    // Invalidate relevant Redis caches
    try {
      await ensureRedisConnection();
      const keysToDelete = await redisClient.keys(`product:${productId}:*`);
      if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
        console.log(`Cache invalidated for product ${productId}:`, keysToDelete);
      }
      // Also invalidate general product list caches
      const productListKeys = await redisClient.keys(`products:tenant:${tenantId}:*`);
      if (productListKeys.length > 0) {
        await redisClient.del(productListKeys);
        console.log(`Product list cache invalidated for tenant ${tenantId}:`, productListKeys);
      }
    } catch (redisError) {
      console.warn(`Redis cache invalidation error for product ${productId}:`, redisError);
      // Do not let cache errors block the success response
    }

    return NextResponse.json({ message: `Produk "${product.name}" berhasil dihapus.` }, { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting product ${productId}:`, error);
    let errorMessage = 'Gagal menghapus produk.';
    if (error.code === 'P2025') { // Prisma error code for record not found
        errorMessage = 'Produk tidak ditemukan.';
        return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// You can also add GET, PUT handlers here if needed for fetching/updating a single product
export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const productId = params.productId;
  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    const currentUser = await getCurrentUser();
    const tenantId = currentUser.tenantId;

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        tenantId: tenantId,
      },
      include: {
        category: true,
        variants: {
          include: {
            options: true,
          },
        },
        combinations: true,
        inventories: {
          include: {
            shelf: {
              include: {
                area: {
                  include: {
                    warehouse: true,
                  }
                }
              }
            }
          }
        }
        // Add other relations as needed
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    // Process product data if necessary (e.g., calculate total stock, price ranges)
    // Similar to the GET all products endpoint logic
    let totalStock = 0;
    let minVariantPrice: number | null = null;
    let maxVariantPrice: number | null = null;
    let processedCombinations: any[] = [];

    if (product.hasVariants && product.combinations) {
      const cacheKey = `product:${product.id}:combinations_with_imageUrl_v1`;
      let cachedDataString: string | null = null;
      try {
        await ensureRedisConnection();
        cachedDataString = await redisClient.get(cacheKey);
      } catch (redisError) {
        console.warn(`Redis GET error for key ${cacheKey}:`, redisError);
      }

      if (cachedDataString) {
        try {
          processedCombinations = JSON.parse(cachedDataString);
        } catch (parseError) {
          cachedDataString = null; 
        }
      }
      
      if (!cachedDataString) {
        const rawCombinations = await prisma.productVariantCombination.findMany({
          where: { productId: product.id },
          select: { 
            id: true, 
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

        const productVariantOptionsWithImages = await prisma.productVariantOption.findMany({
          where: {
            variant: {
              productId: product.id,
            },
            image: { not: null },
          },
          select: {
            value: true,
            image: true,
            variant: { select: { name: true } },
          },
        });

        const findRepresentativeImage = (
          comboOpts: Record<string, string>,
          allOptsWithImgs: Array<{value: string, image: string | null, variant: {name: string}}>
        ): string | null => {
          for (const variantNameKey in comboOpts) {
            const optionVal = comboOpts[variantNameKey];
            const foundOpt = allOptsWithImgs.find(
              opt => opt.variant.name === variantNameKey && opt.value === optionVal && opt.image
            );
            if (foundOpt && foundOpt.image) {
              return foundOpt.image;
            }
          }
          return null;
        };

        processedCombinations = rawCombinations.map(combo => ({
          ...combo,
          imageUrl: findRepresentativeImage(combo.options as Record<string, string>, productVariantOptionsWithImages),
        }));
        
        try {
          await redisClient.set(cacheKey, JSON.stringify(processedCombinations), { EX: 300 });
        } catch (redisSetError) {
          console.warn(`Redis SET error for key ${cacheKey}:`, redisSetError);
        }
      }

      totalStock = processedCombinations.reduce((sum, combo) => sum + (combo.quantity || 0), 0);
      if (processedCombinations.length > 0) {
        const prices = processedCombinations.map(c => c.price);
        minVariantPrice = Math.min(...prices);
        maxVariantPrice = Math.max(...prices);
      }
    } else if (product.inventories) {
      totalStock = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    }

    const responseProduct = {
      ...product,
      totalStock,
      minVariantPrice,
      maxVariantPrice,
      combinations: product.hasVariants ? processedCombinations : undefined,
      // Remove redundant nested data if already processed
      // inventories: undefined, // if stock is calculated
    };

    return NextResponse.json(responseProduct, { status: 200 });

  } catch (error: any) {
    console.error(`Error fetching product ${productId}:`, error);
    let errorMessage = 'Gagal mengambil data produk.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}