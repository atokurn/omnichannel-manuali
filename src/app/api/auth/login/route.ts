import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Define the schema for login input validation
const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const COOKIE_NAME = 'inventory-auth-token'; // Make sure this matches the name used elsewhere
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Attempt to log in the user
    const { user, token } = await loginUser({ email, password });

    // Set the token in an HTTP-only cookie
    const cookieStore = await cookies(); // Added await here
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax', // Recommended for most cases
      path: '/', // Make the cookie available across the site
      maxAge: TOKEN_EXPIRY_MS / 1000, // maxAge is in seconds
      expires: new Date(Date.now() + TOKEN_EXPIRY_MS), // Also set expires for older browsers
    });

    // Return the user data (without password)
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Login API error:', error);

    // Handle specific errors from loginUser
    if (error instanceof Error && error.message === 'Invalid credentials') {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Handle generic errors
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}