import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productVariantCombinations } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params;

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
      ),
      orderBy: [asc(productVariantCombinations.sku)],
      with: {
        product: {
          columns: { tenantId: true }
        }
      }
    });

    // Filter by tenantId in JS or ensure we check it.
    const filteredCombinations = variantCombinations.filter(vc => vc.product && vc.product.tenantId === tenantId);

    // Clean up response to remove `product` object if not needed
    const responseData = filteredCombinations.map(vc => {
      const { product, ...rest } = vc;
      return rest;
    });

    if (responseData.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error({ message: 'Failed to fetch variant combinations', productId, error });
    return NextResponse.json({ message: 'Gagal mengambil data kombinasi varian' }, { status: 500 });
  }
}