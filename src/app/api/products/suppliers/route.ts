import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Skema validasi untuk data supplier (POST)
const SupplierPostSchema = z.object({
  name: z.string().min(1, 'Nama supplier harus diisi'),
  contactPerson: z.string().min(1, 'Nama kontak person harus diisi'),
  phone: z.string().min(1, 'Nomor telepon harus diisi').regex(/^\+?[0-9\s\-()]+$/, 'Format nomor telepon tidak valid'),
  email: z.string().min(1, 'Email harus diisi').email('Format email tidak valid'),
  address: z.string().min(1, 'Alamat harus diisi'),
  status: z.enum(['Aktif', 'Nonaktif']).default('Aktif'),
});

// Skema validasi untuk data supplier (PUT)
const SupplierPutSchema = SupplierPostSchema.partial(); // Semua field opsional untuk update

// GET: Mengambil daftar supplier dengan pagination
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [suppliers, totalSuppliers] = await prisma.$transaction([
      prisma.supplier.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.supplier.count(),
    ]);

    const totalPages = Math.ceil(totalSuppliers / limit);

    return NextResponse.json({
      data: suppliers,
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

    // Cek apakah supplier dengan email yang sama sudah ada
    const existingSupplier = await prisma.supplier.findUnique({
      where: { email: validation.data.email }
    });

    if (existingSupplier) {
      return NextResponse.json({ message: 'Supplier dengan email tersebut sudah ada' }, { status: 409 });
    }

    // Buat supplier baru
    const newSupplier = await prisma.supplier.create({
      data: validation.data,
    });

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

    const deleteResult = await prisma.supplier.deleteMany({
      where: {
        id: {
          in: idsToDelete,
        },
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ message: 'Tidak ada supplier yang ditemukan dengan ID yang diberikan' }, { status: 404 });
    }

    return NextResponse.json({ message: `${deleteResult.count} supplier berhasil dihapus` });

  } catch (error) {
    console.error('Failed to delete suppliers:', error);
    // Handle potential foreign key constraint errors if suppliers are linked to other tables
    if (error instanceof Error && 'code' in error && error.code === 'P2003') {
        return NextResponse.json({ message: 'Gagal menghapus supplier karena masih terkait dengan data lain (misal: pesanan pembelian).' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Gagal menghapus supplier' }, { status: 500 });
  }
}