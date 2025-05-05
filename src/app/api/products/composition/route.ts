import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
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
    const newComposition = await prisma.$transaction(async (tx) => {
      // Buat entri ProductComposition
      const composition = await tx.productComposition.create({
        data: {
          tenantId: tenantId,
          productId: isTemplate ? null : productId,
          isTemplate: isTemplate,
          templateName: isTemplate ? templateName : null,
          // materials akan dibuat setelahnya
        },
      });

      // Buat entri CompositionMaterial untuk setiap material
      await tx.compositionMaterial.createMany({
        data: materials.map(material => ({
          compositionId: composition.id,
          materialId: material.materialId,
          quantity: material.quantity,
          tenantId: tenantId, // Pastikan tenantId juga ada di CompositionMaterial
        })),
      });

      // Ambil kembali komposisi yang baru dibuat beserta materialnya
      return tx.productComposition.findUnique({
        where: { id: composition.id },
        include: {
          materials: true, // Sertakan material yang baru dibuat
        },
      });
    });

    return NextResponse.json(newComposition, { status: 201 });

  } catch (error) {
    console.error('Gagal menyimpan komposisi produk:', error);
    // Handle error spesifik Prisma jika perlu
    if (error instanceof Error && error.message.includes('prisma')) {
        return NextResponse.json({ message: 'Terjadi kesalahan database saat menyimpan komposisi' }, { status: 500 });
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

    const [compositions, totalItems] = await prisma.$transaction([
      prisma.productComposition.findMany({
        where: { tenantId },
        skip: skip,
        take: limit,
        include: {
          product: { // Include product to get the name
            select: {
              name: true,
            },
          },
          _count: { // Count related materials
            select: { materials: true },
          },
        },
        orderBy: {
          createdAt: 'desc', // Or any other desired order
        },
      }),
      prisma.productComposition.count({ where: { tenantId } }),
    ]);

    const formattedCompositions = compositions.map(comp => ({
      id: comp.id,
      // Use templateName if it's a template, otherwise use productName
      productName: comp.isTemplate ? comp.templateName : comp.product?.name ?? 'Produk Tidak Ditemukan',
      materialCount: comp._count.materials,
      createdAt: comp.createdAt.toISOString(), // Format date as ISO string
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