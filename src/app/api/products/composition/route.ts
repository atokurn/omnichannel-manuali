import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productCompositions, compositionMaterials } from '@/lib/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';
import { z } from 'zod';

// Skema validasi untuk material dalam komposisi
const CompositionMaterialSchema = z.object({
  materialId: z.string().min(1, 'Material ID harus diisi'),
  quantity: z.number().positive('Jumlah harus lebih besar dari 0'),
  // unit tidak perlu divalidasi di sini karena diambil dari material
});

// Skema validasi untuk data komposisi baru
const CreateCompositionSchema = z.object({
  productId: z.string().optional().nullable(), // Opsional jika isTemplate true
  isTemplate: z.boolean(),
  templateName: z.string().optional().nullable(), // Opsional jika isTemplate false
  materials: z.array(CompositionMaterialSchema).min(1, 'Minimal satu material harus ditambahkan'),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id');
    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID tidak ditemukan di header' }, { status: 400 });
    }

    const body = await request.json();
    const validation = CreateCompositionSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation errors:', validation.error.errors);
      return NextResponse.json({ message: 'Data input tidak valid', errors: validation.error.errors }, { status: 400 });
    }

    const { productId, isTemplate, templateName, materials } = validation.data;

    // Validasi tambahan: productId harus ada jika bukan template, templateName harus ada jika template
    if (!isTemplate && !productId) {
      return NextResponse.json({ message: 'Product ID harus diisi jika bukan template' }, { status: 400 });
    }
    if (isTemplate && (!templateName || templateName.trim() === '')) {
      return NextResponse.json({ message: 'Nama template harus diisi jika merupakan template' }, { status: 400 });
    }

    // Mulai transaksi database
    const result = await db.transaction(async (tx) => {
      // Buat entri ProductComposition
      const [composition] = await tx.insert(productCompositions).values({
        id: crypto.randomUUID(),
        tenantId: tenantId,
        productId: isTemplate ? null : productId,
        isTemplate: isTemplate,
        templateName: isTemplate ? templateName : null,
      }).returning();

      // Buat entri CompositionMaterial untuk setiap material
      const materialsToInsert = materials.map(material => ({
        id: crypto.randomUUID(),
        compositionId: composition.id,
        materialId: material.materialId,
        quantity: material.quantity,
        tenantId: tenantId,
      }));

      await tx.insert(compositionMaterials).values(materialsToInsert);

      // Ambil kembali komposisi yang baru dibuat beserta materialnya
      return tx.query.productCompositions.findFirst({
        where: eq(productCompositions.id, composition.id),
        with: {
          materials: true
        }
      });
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Gagal menyimpan komposisi produk:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Gagal menyimpan komposisi produk' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id');
    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID tidak ditemukan di header' }, { status: 400 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const compositionsData = await db.query.productCompositions.findMany({
      where: (productCompositions, { eq }) => eq(productCompositions.tenantId, tenantId),
      limit: limit,
      offset: skip,
      orderBy: [desc(productCompositions.createdAt)],
      with: {
        product: {
          columns: { name: true }
        },
        materials: true // We fetch all materials, then count them in JS or use aggregate count logic if optimized
      }
    });

    // Efficient counting in Drizzle often requires simpler query or subqueries.
    // fetch `materials` here, array length is count. If many materials, better distinct query.
    // But original code used `_count`. 
    // We already fetched materials array.

    const [countResult] = await db.select({ count: count() })
      .from(productCompositions)
      .where(eq(productCompositions.tenantId, tenantId));

    const totalItems = countResult ? countResult.count : 0;

    const formattedCompositions = compositionsData.map(comp => ({
      id: comp.id,
      productName: comp.isTemplate ? comp.templateName : comp.product?.name ?? 'Produk Tidak Ditemukan',
      materialCount: comp.materials.length,
      createdAt: comp.createdAt.toISOString(),
      isTemplate: comp.isTemplate,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: formattedCompositions,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Gagal mengambil data komposisi produk:', error);
    return NextResponse.json({ message: 'Gagal mengambil data komposisi produk' }, { status: 500 });
  }
}

// TODO: Implement PUT, DELETE handlers as needed