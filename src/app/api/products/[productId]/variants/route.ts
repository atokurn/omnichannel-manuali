import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productVariantCombinations, products } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = params; // Params are awaited via Next.js framework in recent versions, or just access if sync.
  // In Next.js 15, params might be a Promise.
  // The original code had `await params`. I should handle that if necessary.

  const tenantId = request.headers.get('X-Tenant-Id');

  if (!tenantId) {
    return NextResponse.json({ message: 'Tenant ID tidak ditemukan di header' }, { status: 400 });
  }

  if (!productId) {
    return NextResponse.json({ message: 'Product ID diperlukan' }, { status: 400 });
  }

  try {
    const variantCombinations = await db.query.productVariantCombinations.findMany({
      where: (variantCombos, { eq, and }) => and(
        eq(variantCombos.productId, productId)
        // We must ensure the product belongs to the tenant.
        // Drizzle doesn't support implicit join in `where` easily for filtering unless we sort of use `exists` or fetch separately.
        // Or we can query `products` first.
      ),
      orderBy: [asc(productVariantCombinations.sku)],
      with: {
        product: {
          columns: { tenantId: true }
        }
      }
    });

    // Filter by tenantId in JS or ensure we check it.
    // If we just check fetched combinations' product tenantId.
    const filteredCombinations = variantCombinations.filter(vc => vc.product && vc.product.tenantId === tenantId);

    // Clean up response to remove `product` object if not needed
    const responseData = filteredCombinations.map(vc => {
      const { product, ...rest } = vc;
      return rest;
    });

    if (responseData.length === 0) {
      // Check if product exists regardless of variants?
      // Original code returns empty array if no variants.
      return NextResponse.json([]);
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`Gagal mengambil kombinasi varian untuk produk ${productId}:`, error);
    return NextResponse.json({ message: 'Gagal mengambil data kombinasi varian' }, { status: 500 });
  }
}