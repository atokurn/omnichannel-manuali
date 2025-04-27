import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'; // Menggunakan jose untuk Edge compatibility

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
); // jose memerlukan Uint8Array
const COOKIE_NAME = 'inventory-auth-token';

// Daftar rute publik yang tidak memerlukan autentikasi
const publicRoutes = ['/sign', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let isAuthenticated = false;
  try {
    if (token) {
      // Verifikasi token menggunakan jose
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    }
  } catch (error) {
    // Token tidak valid atau kedaluwarsa
    console.error('Invalid token:', error);
    isAuthenticated = false;
    // Hapus cookie jika tidak valid
    const response = NextResponse.redirect(new URL('/sign', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // Jika pengguna sudah terautentikasi dan mencoba mengakses halaman login/signup
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    // Arahkan ke dashboard atau halaman utama setelah login
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika pengguna belum terautentikasi dan mencoba mengakses rute yang dilindungi
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    // Arahkan ke halaman login
    return NextResponse.redirect(new URL('/sign', request.url));
  }

  // Lanjutkan ke rute yang diminta jika tidak ada kondisi pengalihan yang terpenuhi
  return NextResponse.next();
}

// Tentukan rute mana yang akan dijalankan oleh middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua path permintaan kecuali untuk:
     * - Rute API (_next/static, _next/image, favicon.ico)
     * - Aset statis (placeholder.svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|placeholder.svg).*)',
  ],
};