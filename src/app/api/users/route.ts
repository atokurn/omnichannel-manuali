import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userRoles, roles } from '@/lib/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { z } from 'zod';

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
    const usersData = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.tenantId, tenantId),
      orderBy: [desc(users.createdAt)],
      limit: limit,
      offset: skip,
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      }
    });

    const [countResult] = await db.select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    const totalUsers = countResult ? countResult.count : 0;

    // Format data untuk response
    const formattedUsers = usersData.map(user => ({
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
    const existingUser = await db.query.users.findFirst({
      where: (users, { and, eq }) => and(eq(users.email, validation.data.email), eq(users.tenantId, tenantId))
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah digunakan' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hash(validation.data.password, SALT_ROUNDS);

    // Transactional create
    const newUserWithRoles = await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(users).values({
        id: crypto.randomUUID(),
        name: validation.data.name,
        email: validation.data.email,
        password: hashedPassword,
        tenantId: tenantId,
        status: 'active'
      }).returning();

      await tx.insert(userRoles).values({
        userId: newUser.id,
        roleId: validation.data.roleId
      });

      // Re-fetch to return mostly full structure expected by frontend (with role names), or just construct it.
      // Constructing it is cheaper, but we need role name.
      // Let's fetch role name.
      const role = await tx.query.roles.findFirst({
        where: eq(roles.id, validation.data.roleId),
        columns: { id: true, name: true }
      });

      return {
        ...newUser,
        userRoles: role ? [{ role }] : []
      };
    });

    // Format response tanpa password
    const { password, ...userWithoutPassword } = newUserWithRoles;
    const formattedUser = {
      ...userWithoutPassword,
      roles: newUserWithRoles.userRoles.map((ur: any) => ({
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