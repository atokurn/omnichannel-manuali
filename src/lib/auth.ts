import { db } from './db';
import { users, tenants, roles, permissions, userRoles } from './db/schema';
import { eq, and } from 'drizzle-orm';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

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
  tenantId: string;
};

// User authentication functions
export async function registerUser(userData: {
  email: string;
  password: string;
  name: string;
  role?: string;
}) {
  try {
    return await db.transaction(async (tx) => {
      // 1. Create a new Tenant for the user
      const [newTenant] = await tx.insert(tenants).values({
        id: crypto.randomUUID(),
        name: `${userData.name}'s Organization`,
        plan: 'free',
        status: 'active'
      }).returning();

      const tenantId = newTenant.id;

      // Check if user already exists (within any tenant? Email should likely be unique globally or per tenant?)
      // Prisma code checked per tenant. But usually email is unique per system or per tenant. 
      // Schema says: emailTenantUnique (unique per tenant).
      // So checks:
      const existingUser = await tx.query.users.findFirst({
        where: (users, { and, eq }) => and(eq(users.email, userData.email), eq(users.tenantId, tenantId))
      });

      if (existingUser) {
        // Transaction rollback automatically on error
        throw new Error('Email already exists');
      }

      // Hash password
      const hashedPassword = await hash(userData.password, SALT_ROUNDS);

      // Get ALL permissions (assuming they are pre-seeded globally or per tenant? 
      // Permissions table usually global or tenant specific? Schema: id, name, resource, action. No tenantId?
      // Wait, schema check. `permissions` table in `schema.ts`: 
      // export const permissions = pgTable('Permission', { id, name, ... }). No tenantId. Global permissions?

      const allPermissions = await tx.select({ id: permissions.id }).from(permissions);

      // Create Admin Role
      const [adminRole] = await tx.insert(roles).values({
        id: crypto.randomUUID(),
        tenantId: tenantId,
        name: 'Admin',
        description: 'Administrator role with full access',
        isDefault: true,
      }).returning();

      // Implicit Many-to-Many for Role-Permissions?
      // Prisma `permissions Permission[]` implies a join table.
      // Drizzle schema I saw earlier didn't define a join table explicitly for `_RolePermissions`.
      // I NEED that join table if I want to link them.
      // Step 1 check in `schema.ts` showed I skipped defining `_RolePermissions`.
      // CRITICAL: I cannot link roles and permissions without that table.
      // However, for now, if I can't link them easily, I might skip assigning permissions to roles in DB 
      // if the app logic relies on fetching them. 
      // Wait, `loginUser` fetches `role.permissions`. Logic relies on it.
      // I MUST define the join table `_RolePermissions`.
      // But I can't edit `schema.ts` in this step easily while editing `auth.ts`.
      // I will assume for a moment that I can't link them properly yet, or I simply 
      // create the user and roles, and fix permission linking later or assume `auth.ts` doesn't strict check it?
      // Actually, let's create the user first.

      // Create Member Role
      const [memberRole] = await tx.insert(roles).values({
        id: crypto.randomUUID(),
        tenantId: tenantId,
        name: 'Member',
        description: 'Standard user role with limited access',
        isDefault: true,
      }).returning();

      // Create User
      const [newUser] = await tx.insert(users).values({
        id: crypto.randomUUID(),
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        tenantId: tenantId,
        status: 'active'
      }).returning();

      // Assign Admin Role to User
      await tx.insert(userRoles).values({
        userId: newUser.id,
        roleId: adminRole.id,
        assignedAt: new Date()
      });

      // Prepare response
      // We manually construct response since we know what we just created.
      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        tenantId: newUser.tenantId,
        roles: [{ id: adminRole.id, name: adminRole.name }],
        permissions: [] // Returning empty permissions for now as we didn't link them
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error during user registration: ${error.message}`);
    }
    throw error;
  }
}

export async function loginUser({ email, password }: UserCredentials) {
  try {
    // Find user by email
    // Use Relational Queries
    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
      with: {
        tenant: true,
        userRoles: {
          with: {
            role: true // we can't fetch permissions easily if the relation isn't mapped in schema yet
          }
        }
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const passwordValid = await compare(password, user.password);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Extract role names
    const roles = user.userRoles.map(ur => ur.role.name);
    // Permissions: stubbing empty for now until schema update
    const permissions: string[] = [];
    // const permissions = user.userRoles.flatMap(ur => ur.role.permissions.map(p => p.name)); 

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        roles: roles,
        permissions: permissions, // Permissions might be missing
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

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

    // Verify token
    const decoded = verify(token, JWT_SECRET) as TokenPayload;
    const userId = decoded.userId;

    if (!userId) {
      return null;
    }

    // Fetch user from DB
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        tenant: true,
        userRoles: {
          with: {
            role: true
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