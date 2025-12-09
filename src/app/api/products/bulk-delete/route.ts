import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, inventories, productVariants, productVariantOptions, productVariantCombinations } from '@/lib/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
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

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const tenantId = currentUser.tenantId;

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Array ID produk wajib diisi.' }, { status: 400 });
    }

    if (!ids.every((id: any) => typeof id === 'string')) {
      return NextResponse.json({ error: 'Semua ID produk dalam array harus berupa string.' }, { status: 400 });
    }

    // Verify products exist and belong to tenant
    const productsToDelete = await db.select({ id: products.id, name: products.name })
      .from(products)
      .where(
        and(
          inArray(products.id, ids),
          eq(products.tenantId, tenantId)
        )
      );

    const foundProductIds = productsToDelete.map(p => p.id);
    const notFoundIds = ids.filter(id => !foundProductIds.includes(id));

    if (notFoundIds.length > 0) {
      console.warn(`Bulk delete: Produk dengan ID berikut tidak ditemukan atau tidak dimiliki oleh tenant ${tenantId}: ${notFoundIds.join(', ')}`);
    }

    if (foundProductIds.length === 0) {
      return NextResponse.json({ error: 'Tidak ada produk yang ditemukan untuk dihapus sesuai dengan ID yang diberikan dan hak akses tenant.' }, { status: 404 });
    }

    // Transaction
    await db.transaction(async (tx) => {
      // 1. Delete ProductVariantCombinations
      await tx.delete(productVariantCombinations)
        .where(inArray(productVariantCombinations.productId, foundProductIds));

      // 2. Delete ProductVariantOptions
      // We need variant IDs to delete options (if cascade isn't reliable or preferred manual)
      // Drizzle doesn't support "delete from T1 where T1.fk in (select ...)" as easily with `inArray` if the subquery isn't perfectly typed, 
      // but it definitely supports subqueries.

      // Let's stick to safe manual deletion flow similar to original code to ensure order and completeness.
      const variants = await tx.select({ id: productVariants.id })
        .from(productVariants)
        .where(inArray(productVariants.productId, foundProductIds));

      const variantIds = variants.map(v => v.id);

      if (variantIds.length > 0) {
        await tx.delete(productVariantOptions)
          .where(inArray(productVariantOptions.variantId, variantIds));
      }

      // 3. Delete ProductVariants
      await tx.delete(productVariants)
        .where(inArray(productVariants.productId, foundProductIds));

      // 4. Delete Inventory records
      await tx.delete(inventories)
        .where(inArray(inventories.productId, foundProductIds));

      // 5. Delete Products
      await tx.delete(products)
        .where(inArray(products.id, foundProductIds));
    });

    // Redis Invalidation
    try {
      await ensureRedisConnection();
      const productCacheKeysToDelete: string[] = [];
      foundProductIds.forEach(id => {
        productCacheKeysToDelete.push(`product:${id}:*`);
      });

      if (productCacheKeysToDelete.length > 0) {
        // We need to find all keys matching these patterns
        const flatKeys = (await Promise.all(productCacheKeysToDelete.map(pattern => redisClient.keys(pattern)))).flat();
        if (flatKeys.length > 0) {
          await redisClient.del(flatKeys);
          console.log(`Cache invalidated for multiple products:`, flatKeys);
        }
      }

      const productListKeysPattern = `products:tenant:${tenantId}:*`;
      const productListKeys = await redisClient.keys(productListKeysPattern);
      if (productListKeys.length > 0) {
        await redisClient.del(productListKeys);
        console.log(`Product list cache invalidated for tenant ${tenantId}:`, productListKeys);
      }
    } catch (redisError) {
      console.warn(`Redis cache invalidation error during bulk delete:`, redisError);
    }

    const count = foundProductIds.length;
    let message = `${count} produk berhasil dihapus.`;
    if (notFoundIds.length > 0) {
      message += ` ${notFoundIds.length} produk tidak ditemukan atau tidak dapat diakses.`;
    }

    return NextResponse.json({ message }, { status: 200 });

  } catch (error: any) {
    console.error('Error during bulk delete products:', error);
    let errorMessage = 'Gagal menghapus produk secara massal.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}