import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema validasi untuk kategori
const CategorySchema = z.object({
  name: z.string().min(1, { message: 'Nama kategori tidak boleh kosong' }),
  description: z.string().optional(),
});

/**
 * GET /api/products/categories
 * Endpoint untuk mendapatkan daftar kategori dengan pagination
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Dapatkan tenantId dari header request yang ditambahkan oleh middleware
    const tenantId = request.headers.get('X-Tenant-Id');

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID tidak ditemukan di request' }, { status: 401 });
    }

    // Ambil data dari database dengan pagination dan filter berdasarkan tenant
    const [categories, totalCategories] = await prisma.$transaction([
      prisma.category.findMany({
        where: {
          tenantId: tenantId
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.category.count({
        where: {
          tenantId: tenantId
        }
      }),
    ]);

    // Format data untuk response
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(totalCategories / limit);

    // Buat response dengan format yang konsisten
    const responseData = {
      data: formattedCategories,
      pagination: {
        page,
        limit,
        totalItems: totalCategories,
        totalPages,
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ message: 'Gagal mengambil data kategori' }, { status: 500 });
  }
}

/**
 * POST /api/products/categories
 * Endpoint untuk membuat kategori baru
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = CategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Dapatkan tenantId dari header request yang ditambahkan oleh middleware
    const tenantId = request.headers.get('X-Tenant-Id');

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID tidak ditemukan di request' }, { status: 401 });
    }

    // Cek apakah kategori dengan nama yang sama sudah ada dalam tenant yang sama
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name: validation.data.name,
        tenantId: tenantId
      }
    });

    if (existingCategory) {
      return NextResponse.json({ message: 'Kategori dengan nama tersebut sudah ada' }, { status: 409 });
    }

    // Buat kategori baru dengan tenantId
    const newCategory = await prisma.category.create({
      data: {
        ...validation.data,
        tenantId: tenantId
      },
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ message: 'Gagal membuat kategori baru' }, { status: 500 });
  }
}

/**
 * DELETE /api/products/categories?ids=id1,id2,id3
 * Endpoint untuk menghapus satu atau beberapa kategori
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ message: 'Parameter IDs diperlukan' }, { status: 400 });
    }

    const idsToDelete = idsParam.split(',');

    if (idsToDelete.length === 0) {
      return NextResponse.json({ message: 'Tidak ada ID yang diberikan untuk dihapus' }, { status: 400 });
    }

    // Dapatkan tenantId dari header request
    const tenantId = request.headers.get('X-Tenant-Id');

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID tidak ditemukan di request' }, { status: 401 });
    }

    // Hapus kategori, pastikan hanya menghapus dari tenant yang benar
    const deleteResult = await prisma.category.deleteMany({
      where: {
        id: {
          in: idsToDelete,
        },
        tenantId: tenantId, // Tambahkan filter tenantId
      },
    });

    return NextResponse.json({
      message: `${deleteResult.count} kategori berhasil dihapus`,
      count: deleteResult.count,
    });

  } catch (error) {
    console.error('Failed to delete categories:', error);
    return NextResponse.json({ message: 'Gagal menghapus kategori' }, { status: 500 });
  }
}