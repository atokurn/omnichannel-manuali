import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);
const COOKIE_NAME = 'inventory-auth-token';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verifikasi token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    if (!userId) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Dapatkan user dengan tenant dan roles
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        tenant: true,
        userRoles: {
          with: {
            role: {
              with: {
                permissions: {
                  with: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Periksa status user dan tenant
    if (user.status !== 'active') {
      return NextResponse.json(
        { message: 'User account is inactive' },
        { status: 403 }
      );
    }

    if (user.tenant.status !== 'active') {
      return NextResponse.json(
        { message: 'Tenant account is suspended' },
        { status: 403 }
      );
    }

    // Format data user untuk response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenant.id,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        plan: user.tenant.plan,
        status: user.tenant.status
      },
      roles: user.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        permissions: ur.role.permissions.map(rp => rp.permission)
      }))
    };

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}