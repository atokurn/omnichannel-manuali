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

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const tenantId = currentUser.tenantId;

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Array ID produk wajib diisi.' }, { status: 400 });
    }

    // Validasi bahwa semua ID adalah string
    if (!ids.every(id => typeof id === 'string')) {
        return NextResponse.json({ error: 'Semua ID produk dalam array harus berupa string.' }, { status: 400 });
    }

    // Memastikan produk yang akan dihapus milik tenant yang benar
    const productsToDelete = await prisma.product.findMany({
        where: {
            id: { in: ids },
            tenantId: tenantId,
        },
        select: { id: true, name: true }, // Hanya pilih ID dan nama untuk pesan sukses
    });

    const foundProductIds = productsToDelete.map(p => p.id);
    const notFoundIds = ids.filter(id => !foundProductIds.includes(id));

    if (notFoundIds.length > 0) {
        console.warn(`Bulk delete: Produk dengan ID berikut tidak ditemukan atau tidak dimiliki oleh tenant ${tenantId}: ${notFoundIds.join(', ')}`);
        // Anda bisa memilih untuk melanjutkan penghapusan produk yang ditemukan atau mengembalikan error
        // Untuk saat ini, kita akan melanjutkan dengan yang ditemukan dan memberi tahu tentang yang tidak ditemukan
    }

    if (foundProductIds.length === 0) {
        return NextResponse.json({ error: 'Tidak ada produk yang ditemukan untuk dihapus sesuai dengan ID yang diberikan dan hak akses tenant.' }, { status: 404 });
    }

    // Lakukan penghapusan dalam transaksi untuk memastikan integritas data
    await prisma.$transaction(async (tx) => {
      // 1. Delete ProductVariantCombinations for all selected products
      await tx.productVariantCombination.deleteMany({
        where: { productId: { in: foundProductIds } },
      });

      // 2. Delete ProductVariantOptions
      const variants = await tx.productVariant.findMany({
        where: { productId: { in: foundProductIds } },
        select: { id: true },
      });
      const variantIds = variants.map(v => v.id);
      if (variantIds.length > 0) {
        await tx.productVariantOption.deleteMany({
          where: { variantId: { in: variantIds } },
        });
      }

      // 3. Delete ProductVariants
      await tx.productVariant.deleteMany({
        where: { productId: { in: foundProductIds } },
      });

      // 4. Delete Inventory records
      await tx.inventory.deleteMany({
        where: { productId: { in: foundProductIds } },
      });

      // 5. Delete the Products themselves
      await tx.product.deleteMany({
        where: { id: { in: foundProductIds } },
      });
    });

    // Invalidate relevant Redis caches
    try {
      await ensureRedisConnection();
      const productCacheKeysToDelete: string[] = [];
      foundProductIds.forEach(id => {
        productCacheKeysToDelete.push(`product:${id}:*`);
      });
      
      if (productCacheKeysToDelete.length > 0) {
        // Redis DEL command can take multiple keys
        const flatKeys = (await Promise.all(productCacheKeysToDelete.map(pattern => redisClient.keys(pattern)))).flat();
        if (flatKeys.length > 0) {
            await redisClient.del(flatKeys);
            console.log(`Cache invalidated for multiple products:`, flatKeys);
        }
      }

      // Also invalidate general product list caches for the tenant
      const productListKeysPattern = `products:tenant:${tenantId}:*`;
      const productListKeys = await redisClient.keys(productListKeysPattern);
      if (productListKeys.length > 0) {
        await redisClient.del(productListKeys);
        console.log(`Product list cache invalidated for tenant ${tenantId}:`, productListKeys);
      }
    } catch (redisError) {
      console.warn(`Redis cache invalidation error during bulk delete:`, redisError);
      // Do not let cache errors block the success response
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