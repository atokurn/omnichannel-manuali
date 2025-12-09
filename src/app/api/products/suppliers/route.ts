import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers } from '@/lib/db/schema';
import { eq, and, inArray, count, desc } from 'drizzle-orm';
import { z } from 'zod';

// Skema validasi untuk data supplier (POST)
const SupplierPostSchema = z.object({
  name: z.string().min(1, 'Nama supplier harus diisi'),
  contactPerson: z.string().min(1, 'Nama kontak person harus diisi'),
  phone: z.string().min(1, 'Nomor telepon harus diisi').regex(/^\+?[0-9\s\-()]+$/, 'Format nomor telepon tidak valid'),
  email: z.string().min(1, 'Email harus diisi').email('Format email tidak valid'),
  address: z.string().min(1, 'Alamat harus diisi'),
  status: z.enum(['Aktif', 'Nonaktif']).default('Aktif'),
});

// GET: Mengambil daftar supplier dengan pagination
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

    const suppliersData = await db.query.suppliers.findMany({
      where: (suppliers, { eq }) => eq(suppliers.tenantId, tenantId),
      limit: limit,
      offset: skip,
      orderBy: [desc(suppliers.createdAt)],
    });

    const [countResult] = await db.select({ count: count() })
      .from(suppliers)
      .where(eq(suppliers.tenantId, tenantId));

    const totalSuppliers = countResult ? countResult.count : 0;
    const totalPages = Math.ceil(totalSuppliers / limit);

    return NextResponse.json({
      data: suppliersData,
      pagination: {
        page,
        limit,
        totalItems: totalSuppliers,
        totalPages,
      }
    });

  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return NextResponse.json({ message: 'Gagal mengambil data supplier' }, { status: 500 });
  }
}

// POST: Membuat supplier baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = SupplierPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const tenantId = request.headers.get('X-Tenant-Id');

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID tidak ditemukan di request' }, { status: 401 });
    }

    // Cek apakah supplier dengan email yang sama sudah ada dalam tenant yang sama
    const existingSupplier = await db.query.suppliers.findFirst({
      where: (suppliers, { and, eq }) => and(eq(suppliers.email, validation.data.email), eq(suppliers.tenantId, tenantId))
    });

    if (existingSupplier) {
      return NextResponse.json({ message: 'Supplier dengan email tersebut sudah ada' }, { status: 409 });
    }

    // Buat supplier baru dengan tenantId
    const [newSupplier] = await db.insert(suppliers).values({
      id: crypto.randomUUID(),
      ...validation.data,
      tenantId: tenantId
    }).returning();

    return NextResponse.json(newSupplier, { status: 201 });

  } catch (error) {
    console.error('Failed to create supplier:', error);
    return NextResponse.json({ message: 'Gagal membuat supplier baru' }, { status: 500 });
  }
}

// DELETE: Menghapus satu atau beberapa supplier berdasarkan ID
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ message: 'Parameter IDs diperlukan' }, { status: 400 });
    }

    const idsToDelete = idsParam.split(',').filter(id => id.trim() !== '');

    if (idsToDelete.length === 0) {
      return NextResponse.json({ message: 'Tidak ada ID yang valid untuk dihapus' }, { status: 400 });
    }

    const tenantId = request.headers.get('X-Tenant-Id');

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID tidak ditemukan di request' }, { status: 401 });
    }

    const deleteResult = await db.delete(suppliers)
      .where(
        and(
          inArray(suppliers.id, idsToDelete),
          eq(suppliers.tenantId, tenantId)
        )
      )
      .returning();

    if (deleteResult.length === 0) {
      // Could be none found, or none matched tenant filter
      // If client sent valid IDs but they didn't match tenant, we return 404 effectively for "not found in your tenant"
      // or success with 0 count? Original code returned 404 if count === 0.
      return NextResponse.json({ message: 'Tidak ada supplier yang ditemukan dengan ID yang diberikan' }, { status: 404 });
    }

    return NextResponse.json({ message: `${deleteResult.length} supplier berhasil dihapus` });

  } catch (error) {
    console.error('Failed to delete suppliers:', error);
    // Handle potential foreign key constraint errors
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json({ message: 'Gagal menghapus supplier karena masih terkait dengan data lain (misal: pesanan pembelian).' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Gagal menghapus supplier' }, { status: 500 });
  }
}