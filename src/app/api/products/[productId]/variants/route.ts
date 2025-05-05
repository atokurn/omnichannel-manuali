import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId } = params;
  const tenantId = request.headers.get('X-Tenant-Id');

  if (!tenantId) {
    return NextResponse.json({ message: 'Tenant ID tidak ditemukan di header' }, { status: 400 });
  }

  if (!productId) {
    return NextResponse.json({ message: 'Product ID diperlukan' }, { status: 400 });
  }

  try {
    const variantCombinations = await prisma.productVariantCombination.findMany({
      where: {
        productId: productId,
        // Pastikan hanya mengambil data dari tenant yang benar
        // Asumsi relasi Product -> Tenant sudah ada
        product: {
          tenantId: tenantId,
        },
      },
      // Anda bisa menyertakan relasi lain jika diperlukan
      // include: { ... }
      orderBy: {
        // Urutkan berdasarkan sesuatu jika perlu, misal SKU
        sku: 'asc',
      },
    });

    if (!variantCombinations || variantCombinations.length === 0) {
      // Bisa jadi produk tidak punya varian, atau ID produk salah
      // Kembalikan array kosong atau pesan error sesuai kebutuhan
      return NextResponse.json([]); 
    }

    return NextResponse.json(variantCombinations);

  } catch (error) {
    console.error(`Gagal mengambil kombinasi varian untuk produk ${productId}:`, error);
    return NextResponse.json({ message: 'Gagal mengambil data kombinasi varian' }, { status: 500 });
  }
}