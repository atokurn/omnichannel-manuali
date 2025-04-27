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
  role?: string;
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      // Throw specific error message checked in the route handler
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await hash(userData.password, SALT_ROUNDS);

    // Find the default 'USER' role ID
    const userRole = await prisma.role.findUnique({
      where: { name: 'USER' },
      select: { id: true }, // Only select the ID
    });

    if (!userRole) {
      throw new Error("Default 'USER' role not found. Please seed the database.");
    }

    // Create user first, without the relation
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        // The relation will be created via the join table
      },
    });

    // Create the entry in the UserRole join table
    await prisma.userRole.create({
      data: {
        userId: newUser.id,
        roleId: userRole.id,
      },
    });

    // Fetch the user again with roles included
    const user = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
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
      // This should ideally not happen if creation was successful
      throw new Error("Failed to fetch newly created user with roles.");
    }

    // Remove password from response
    // Prepare user data for response using the new structure
    const rolesData = user.userRoles.map(ur => ({ id: ur.role.id, name: ur.role.name }));
    const permissionsData = [...new Set(user.userRoles.flatMap(ur => ur.role.permissions.map(p => p.name)))];

    // Remove password from the user object before creating the response
    const { password: _, ...userWithoutPassword } = user;

    const userResponse = {
      ...userWithoutPassword, // Spread the user data without password
      roles: rolesData, // Add the structured roles data
      permissions: permissionsData, // Add the structured permissions data
      // Note: userRoles relation data is implicitly excluded by spreading userWithoutPassword
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
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
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
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Middleware for protected routes
export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    try {
      // Get token from cookies
      const cookieStore = cookies();
      const token = cookieStore.get(COOKIE_NAME)?.value;

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token
      const decoded = verify(token, JWT_SECRET) as TokenPayload;

      // Fetch user details from DB based on token to ensure freshness
      const freshUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          roles: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!freshUser) {
        throw new Error('User not found');
      }

      // Extract permissions using the new structure
      const permissions = freshUser.userRoles.flatMap(ur => 
        ur.role.permissions.map(permission => permission.name)
      );
      const uniquePermissions = [...new Set(permissions)];

      // Add user details (including permissions) to request
      (req as any).user = {
        userId: freshUser.id,
        email: freshUser.email,
        roles: freshUser.userRoles.map(ur => ur.role.name),
        permissions: uniquePermissions,
      };

      // Call the handler
      return handler(req);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

// Permission-based authorization
export function withPermission(handler: Function, requiredPermissions: string[]) {
  return withAuth(async (req: NextRequest) => {
    const user = (req as any).user;

    // Check if user has ALL required permissions
    const hasAllPermissions = requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      console.log(`Authorization failed for user ${user.email}. Required: ${requiredPermissions.join(', ')}, User has: ${user.permissions.join(', ')}`);
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

// Set auth cookie
export function setAuthCookie(token: string) {
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
  });
}

// Clear auth cookie
export function clearAuthCookie() {
  cookies().delete(COOKIE_NAME);
}

// Get current user from token
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = verify(token, JWT_SECRET) as TokenPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
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

    if (!user) return null;

    // Prepare user data for response using the new structure
    const rolesData = user.userRoles.map(ur => ({ id: ur.role.id, name: ur.role.name }));
    const permissionsData = [...new Set(user.userRoles.flatMap(ur => ur.role.permissions.map(p => p.name)))];

    // Remove password from the user object before creating the response
    const { password: _, ...userWithoutPassword } = user;

    const userResponse = {
      ...userWithoutPassword, // Spread the user data without password
      roles: rolesData, // Add the structured roles data
      permissions: permissionsData, // Add the structured permissions data
      // Note: userRoles relation data is implicitly excluded by spreading userWithoutPassword
    };

    return userResponse;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}