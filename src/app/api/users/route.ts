import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { z } from 'zod';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Schema validasi untuk user
const UserSchema = z.object({
  name: z.string().min(1, { message: 'Nama tidak boleh kosong' }),
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  roleId: z.string().uuid({ message: 'Role ID tidak valid' }),
});

/**
 * GET /api/users
 * Endpoint untuk mendapatkan daftar user dengan pagination
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
    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          tenantId: tenantId
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            include: {
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.user.count({
        where: {
          tenantId: tenantId
        }
      }),
    ]);

    // Format data untuk response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      roles: user.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name
      }))
    }));

    const totalPages = Math.ceil(totalUsers / limit);

    // Buat response dengan format yang konsisten
    const responseData = {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalItems: totalUsers,
        totalPages,
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'Gagal mengambil data user' }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Endpoint untuk membuat user baru
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = UserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Dapatkan tenantId dari header request yang ditambahkan oleh middleware
    const tenantId = request.headers.get('X-Tenant-Id');

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID tidak ditemukan di request' }, { status: 401 });
    }

    // Cek apakah email sudah digunakan dalam tenant yang sama
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: validation.data.email,
        tenantId: tenantId
      }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah digunakan' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hash(validation.data.password, SALT_ROUNDS);

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        password: hashedPassword,
        tenantId: tenantId,
        status: 'active',
      },
    });

    // Tambahkan role untuk user
    await prisma.userRole.create({
      data: {
        userId: newUser.id,
        roleId: validation.data.roleId,
      },
    });

    // Ambil user dengan role untuk response
    const userWithRoles = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      },
    });

    if (!userWithRoles) {
      throw new Error('Failed to fetch newly created user');
    }

    // Format response tanpa password
    const { password, ...userWithoutPassword } = userWithRoles;
    const formattedUser = {
      ...userWithoutPassword,
      roles: userWithRoles.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name
      }))
    };

    return NextResponse.json(formattedUser, { status: 201 });

  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ message: 'Gagal membuat user baru' }, { status: 500 });
  }
}