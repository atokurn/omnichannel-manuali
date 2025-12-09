import { NextResponse } from 'next/server';

// This file is deprecated and replaced by specific API routes.
// Please refer to:
// - /api/products/route.ts
// - /api/users/route.ts
// - /api/auth/...

export async function GET() {
  return NextResponse.json({ error: 'This endpoint is deprecated. Please use specific API routes.' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'This endpoint is deprecated. Please use specific API routes.' }, { status: 410 });
}