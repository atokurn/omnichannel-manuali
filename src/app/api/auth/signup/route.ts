import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth'; // Asumsikan fungsi ini ada di lib/auth.ts
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    // Panggil fungsi registerUser dari lib/auth.ts
    // tenantId tidak lagi diperlukan karena dibuat di dalam registerUser
    const user = await registerUser({ 
      name, 
      email, 
      password, 
      // tenantId: '00000000-0000-0000-0000-000000000000' // Default tenant ID - Dihapus
    });

    // user object from registerUser already has password removed
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    // Log the specific error received at the API route level
    console.error('API Route Signup Error:', error);
    if (error instanceof Error) {
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack); // Log stack trace for detailed debugging
      // Handle specific known errors
      if (error.message === 'Email already exists') {
          return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
      // Add handling for other potential errors from registerUser
      // Update error message check to match the new one in registerUser
      if (error.message === "Default 'USER' role not found or could not be created for the tenant.") {
          // Log this specific issue clearly
          console.error("CRITICAL: Default 'USER' role missing or could not be created for the tenant.");
          // Return a more specific 500 error
          return NextResponse.json({ error: 'Server configuration error. Please contact support.' }, { status: 500 });
      }
    } else {
      // Log if it's not a standard Error object
      console.error('Non-standard error object received:', error);
    }
    
    // Return a generic error response to the client
    return NextResponse.json({ error: 'Internal server error during signup. Check server logs for details.' }, { status: 500 });
  }
}