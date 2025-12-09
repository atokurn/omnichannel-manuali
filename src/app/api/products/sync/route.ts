import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({
    message: "This endpoint is currently disabled due to schema updates."
  }, { status: 503 });
}

export async function GET(request: Request) {
  return NextResponse.json({
    message: "This endpoint is currently disabled due to schema updates."
  }, { status: 503 });
}