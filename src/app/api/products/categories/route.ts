import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq, and, inArray, count, desc } from 'drizzle-orm';
import { z } from 'zod';

// Schema validasi untuk kategori
const CategorySchema = z.object({
  name: z.string().min(1, { message: 'Nama kategori tidak boleh kosong' }),
  description: z.string().optional(),
  type: z.string().optional(), // Tambahkan validasi untuk tipe
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
    const categoriesData = await db.query.categories.findMany({
      where: (categories, { eq }) => eq(categories.tenantId, tenantId),
      limit: limit,
      offset: skip,
      orderBy: [desc(categories.createdAt)],
    });

    const [countResult] = await db.select({ count: count() })
      .from(categories)
      .where(eq(categories.tenantId, tenantId));

    const totalCategories = countResult ? countResult.count : 0;

    // Format data untuk response
    const formattedCategories = categoriesData.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      type: category.type || '',
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
    const existingCategory = await db.query.categories.findFirst({
      where: (categories, { and, eq }) => and(eq(categories.name, validation.data.name), eq(categories.tenantId, tenantId))
    });

    if (existingCategory) {
      return NextResponse.json({ message: 'Kategori dengan nama tersebut sudah ada' }, { status: 409 });
    }

    // Buat kategori baru dengan tenantId
    const [newCategory] = await db.insert(categories).values({
      id: crypto.randomUUID(),
      name: validation.data.name,
      description: validation.data.description,
      type: validation.data.type,
      tenantId: tenantId
    }).returning();

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    console.error('Failed to create category:', error);
    if (error instanceof Error) {
      console.error(error.message);
    }
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
    const deleteResult = await db.delete(categories)
      .where(
        and(
          inArray(categories.id, idsToDelete),
          eq(categories.tenantId, tenantId)
        )
      )
      .returning();

    return NextResponse.json({
      message: `${deleteResult.length} kategori berhasil dihapus`,
      count: deleteResult.length,
    });

  } catch (error) {
    console.error('Failed to delete categories:', error);
    return NextResponse.json({ message: 'Gagal menghapus kategori' }, { status: 500 });
  }
}