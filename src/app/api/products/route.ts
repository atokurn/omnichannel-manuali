import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received product data:', body);

    // Validasi data
    if (!body.productName) {
      return NextResponse.json({ error: 'Nama produk wajib diisi' }, { status: 400 });
    }

    // Dapatkan ID user dari sesi login aktif
    const userId = await getCurrentUserId();
    
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
          connect: { id: userId }
        },
        // Tambahkan field lain yang diperlukan
        sku: await generateSKU(body.productName, body.addVariant) // Generate SKU dengan format yang lebih baik
      },
    });
    
    // Fungsi helper untuk mendapatkan ID user dari sesi login aktif
    async function getCurrentUserId() {
      // Import fungsi getCurrentUser dari lib/auth
      const { getCurrentUser } = await import('@/lib/auth');
      
      // Dapatkan user yang sedang login
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User tidak terautentikasi. Silakan login terlebih dahulu.');
      }
      
      return currentUser.id;
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

// GET handler untuk mengambil daftar produk
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        sku: true,
        mainImage: true,
        hasVariants: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}