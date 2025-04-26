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
  role: string;
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
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hash(userData.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role ? (userData.role as any) : 'USER',
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function loginUser({ email, password }: UserCredentials) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const passwordValid = await compare(password, user.password);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

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

      // Add user to request
      (req as any).user = decoded;

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

// Role-based authorization
export function withRole(handler: Function, allowedRoles: string[]) {
  return withAuth(async (req: NextRequest) => {
    const user = (req as any).user;

    if (!allowedRoles.includes(user.role)) {
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
    });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}