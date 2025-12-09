import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, inventories, productVariants, productVariantOptions, productVariantCombinations, productImages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser as getUser } from '@/lib/auth';
import redisClient, { ensureRedisConnection } from '@/lib/redis';

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
    const product = await db.query.products.findFirst({
      where: (products, { and, eq }) => and(eq(products.id, productId), eq(products.tenantId, tenantId))
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.' }, { status: 404 });
    }

    // Perform deletion
    // We transactionally delete related data to ensure integrity, although DB cascades might handle some.
    // Inventories do NOT cascade based on schema, so we must delete them.
    await db.transaction(async (tx) => {
      // 1. Delete Inventory records
      await tx.delete(inventories).where(eq(inventories.productId, productId));

      // 2. Delete Product (Should cascade Variants, Combinations, Options, Images if DB is configured, but explicit delete is safer if unsure)
      // Schema says Variants/Combinations cascade.
      // We will just delete Product.
      await tx.delete(products).where(eq(products.id, productId));
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
    }

    return NextResponse.json({ message: `Produk "${product.name}" berhasil dihapus.` }, { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting product ${productId}:`, error);
    let errorMessage = 'Gagal menghapus produk.';
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

    const product = await db.query.products.findFirst({
      where: (products, { and, eq }) => and(eq(products.id, productId), eq(products.tenantId, tenantId)),
      with: {
        category: true,
        variants: {
          with: {
            options: true
          }
        },
        // combinations: true, // Drizzle Relation name might be 'variantCombos' in schema relations?
        // Checking schema relations: productsRelations -> variantCombos: many(productVariantCombinations)
        variantCombos: true,
        inventories: {
          with: {
            shelf: {
              with: {
                area: {
                  with: {
                    warehouse: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    // Map 'variantCombos' back to 'combinations' for frontend compatibility if needed, 
    // or just assume frontend handles it. 
    // Original code returned 'combinations'.
    // We should map it.
    const productWithCombinations = {
      ...product,
      combinations: product.variantCombos,
      variantCombos: undefined, // remove internal name
    };

    // Process product data (total stock, etc) - Similar to list logic
    let totalStock = 0;
    let minVariantPrice: number | null = null;
    let maxVariantPrice: number | null = null;
    let processedCombinations: any[] = [];

    if (productWithCombinations.hasVariants && productWithCombinations.combinations && productWithCombinations.combinations.length > 0) {
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
        // We already fetched combinations in 'product', but need images logic again?
        // Yes, reusing the logic to fetch option images.
        // We can optimize this but let's stick to the logic for consistency.

        const rawCombinations = productWithCombinations.combinations; // Already fetched

        // Fetch options with images
        const productVariantOptionsWithImages = await db.select({
          value: productVariantOptions.value,
          image: productVariantOptions.image,
          variantName: productVariants.name
        })
          .from(productVariantOptions)
          .innerJoin(productVariants, eq(productVariantOptions.variantId, productVariants.id))
          .where(
            and(
              eq(productVariants.productId, product.id),
              sql`${productVariantOptions.image} IS NOT NULL`
            )
          );

        const findRepresentativeImage = (
          comboOpts: Record<string, string>,
          allOptsWithImgs: Array<{ value: string, image: string | null, variantName: string }>
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

        processedCombinations = rawCombinations.map((combo: any) => ({
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
    } else if (productWithCombinations.inventories) {
      totalStock = productWithCombinations.inventories.reduce((sum: number, inv: any) => sum + inv.quantity, 0);
    }

    const responseProduct = {
      ...productWithCombinations,
      totalStock,
      minVariantPrice,
      maxVariantPrice,
      combinations: productWithCombinations.hasVariants ? processedCombinations : undefined,
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