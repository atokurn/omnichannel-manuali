import { prisma } from './db';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Constants
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const TOKEN_EXPIRY = '24h';
const COOKIE_NAME = 'inventory-auth-token';

// Types
type UserCredentials = {
  email: string;
  password: string;
};

type TokenPayload = {
  userId: string;
  email: string;
  roles: string[]; // Store role names
  permissions: string[]; // Store permission names
};

// User authentication functions
export async function registerUser(userData: {
  email: string;
  password: string;
  name: string;
  role?: string; // Role parameter might be deprecated if always 'USER'
  // tenantId?: string; // tenantId is now created internally
}) {
  try {
    // 1. Create a new Tenant for the user
    const newTenant = await prisma.tenant.create({
      data: {
        name: `${userData.name}'s Organization`, // Default tenant name
        // plan and status will use defaults from schema
      }
    });
    const tenantId = newTenant.id;

    // Check if user already exists within the new tenant (should not happen)
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: userData.email,
        // tenantId: userData.tenantId || '00000000-0000-0000-0000-000000000000' // Default tenant ID
        tenantId: tenantId // Check within the newly created tenant
      },
    });

    if (existingUser) {
      // This case is unlikely now but kept for safety
      // Consider deleting the created tenant if registration fails here
      await prisma.tenant.delete({ where: { id: tenantId } }); 
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await hash(userData.password, SALT_ROUNDS);

    // Ambil SEMUA permission yang ada
    const allPermissions = await prisma.permission.findMany({
      select: { id: true } // Hanya ambil ID
    });

    // Buat Role Admin Default dengan SEMUA permission
    const adminRole = await prisma.role.create({
      data: {
        tenantId: tenantId,
        name: 'Admin',
        description: 'Administrator role with full access',
        isDefault: true,
        permissions: {
          connect: allPermissions // Hubungkan semua permission
        }
      }
    });

    // Buat Role Member Default (contoh: hanya dengan view product)
    const viewProductPerm = await prisma.permission.findUnique({ 
      where: { name: 'product:read' },
      select: { id: true }
    });
    const memberRole = await prisma.role.create({
      data: {
        tenantId: tenantId,
        name: 'Member',
        description: 'Standard user role with limited access',
        isDefault: true,
        permissions: {
          connect: viewProductPerm ? [{ id: viewProductPerm.id }] : [] // Hubungkan permission spesifik
        }
      }
    });

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        tenantId: tenantId, // Assign the new tenant ID
      },
    });

    // Tugaskan role Admin ke user yang mendaftar
    await prisma.userRole.create({
      data: {
        userId: newUser.id,
        roleId: adminRole.id, // Gunakan ID dari role Admin
      },
    });

    // Fetch the user again with roles included
    const user = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        tenant: true, // Include tenant info
        userRoles: { 
          include: {
            role: { 
              include: {
                permissions: true 
              }
            }
          }
        }
      },
    });

    if (!user) {
      // Consider cleanup if user fetch fails
      throw new Error("Failed to fetch newly created user with roles.");
    }

    // Prepare user data for response
    const rolesData = user.userRoles.map(ur => ({ id: ur.role.id, name: ur.role.name }));
    const permissionsData = [...new Set(user.userRoles.flatMap(ur => ur.role.permissions.map(p => p.name)))];

    const { password: _, ...userWithoutPassword } = user;

    const userResponse = {
      ...userWithoutPassword,
      roles: rolesData,
      permissions: permissionsData,
    };

    return userResponse;
  } catch (error) {
    // Log more specific details about the error
    if (error instanceof Error) {
      console.error(`Error during user registration for email ${userData.email}: ${error.message}`);
      // Optionally log the stack trace for more details
      console.error(error.stack);
    } else {
      // Log if the error is not a standard Error object
      console.error('An unexpected error occurred during user registration:', error);
    }
    // Re-throw the error to be handled by the API route
    throw error;
  }
}

export async function loginUser({ email, password }: UserCredentials) {
  try {
    // Find user by email only, tenantId is not needed for lookup
    const user = await prisma.user.findFirst({
      where: { 
        email,
        // tenantId: '00000000-0000-0000-0000-000000000000' // Default tenant ID - REMOVED
      },
      include: {
        tenant: true, // Include tenant info
        userRoles: { // Use the explicit relation field
          include: {
            role: { // Include the related Role
              include: {
                permissions: true // Include permissions from the Role
              }
            }
          }
        }
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const passwordValid = await compare(password, user.password);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Extract role names and permission names using the new structure
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur => 
      ur.role.permissions.map(permission => permission.name)
    );
    const uniquePermissions = [...new Set(permissions)]; // Ensure unique permissions

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId, // Sertakan tenantId dalam payload
        roles: roles,
        permissions: uniquePermissions,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Prepare user data for response (excluding password and sensitive relation details)
    // Prepare user data for response using the new structure
    const rolesData = user.userRoles.map(ur => ({ id: ur.role.id, name: ur.role.name }));
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: rolesData,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: userResponse, token };

    // Remove password from response
    // const { password: _, ...userWithoutPassword } = user; // This line is unreachable

    // return { user: userWithoutPassword, token }; // This line is unreachable
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/**
 * Mendapatkan user yang sedang login berdasarkan token JWT di cookie
 * Fungsi ini hanya bisa digunakan di server-side (API routes)
 */
export async function getCurrentUser() {
  try {
    // Ambil cookie dari request
    const cookieStore = await cookies(); // Tambahkan await di sini
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null; // Tidak ada token, user tidak login
    }

    // Verifikasi token
    const decoded = verify(token, JWT_SECRET) as TokenPayload;
    const userId = decoded.userId;

    if (!userId) {
      return null; // Token tidak valid
    }

    // Ambil data user dari database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return null; // User tidak ditemukan
    }

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null; // Return null jika terjadi error
  }
}

// Removed duplicate function definitions (loginUser, withAuth, withPermission, setAuthCookie, clearAuthCookie)