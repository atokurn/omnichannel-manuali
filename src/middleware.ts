import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'; // Menggunakan jose untuk Edge compatibility

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
); // jose memerlukan Uint8Array
const COOKIE_NAME = 'inventory-auth-token';

// Daftar rute publik (halaman) yang tidak memerlukan autentikasi
const publicPageRoutes = ['/sign', '/signup'];

// Daftar rute API publik yang tidak memerlukan autentikasi
const publicApiRoutes = ['/api/auth/login', '/api/auth/register']; // Tambahkan rute API publik lainnya jika perlu

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let isAuthenticated = false;
  try {
    if (token) {
      // Verifikasi token menggunakan jose
      const { payload } = await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
      // Tambahkan tenantId dan userId ke header request
      request.headers.set('X-User-Id', payload.userId as string);
      request.headers.set('X-Tenant-Id', payload.tenantId as string);
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
  if (isAuthenticated && publicPageRoutes.includes(pathname)) {
    // Arahkan ke dashboard atau halaman utama setelah login
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika pengguna belum terautentikasi
  if (!isAuthenticated) {
    // Jika mencoba mengakses rute API publik, izinkan
    if (publicApiRoutes.includes(pathname)) {
      return NextResponse.next(); // Lanjutkan ke API route
    }
    // Jika mencoba mengakses halaman publik, izinkan (atau redirect jika sudah login - ditangani di atas)
    if (publicPageRoutes.includes(pathname)) {
      return NextResponse.next(); // Lanjutkan ke halaman publik
    }
    // Jika mencoba mengakses rute yang dilindungi lainnya, arahkan ke login
    return NextResponse.redirect(new URL('/sign', request.url));
  }

  // Jika pengguna sudah terautentikasi dan mencoba mengakses halaman login/signup (sudah ditangani di atas)
  // if (isAuthenticated && publicPageRoutes.includes(pathname)) { ... }


  // Lanjutkan ke rute yang diminta, teruskan header yang dimodifikasi
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  return response;
}

// Tentukan rute mana yang akan dijalankan oleh middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua path permintaan kecuali untuk:
     * - Rute API (_next/static, _next/image, favicon.ico)
     * - Aset statis (placeholder.svg)
     */
    /*
     * Cocokkan semua path permintaan kecuali untuk:
     * - Aset statis Next.js (_next/static, _next/image, favicon.ico)
     * - Aset statis publik (placeholder.svg)
     * Middleware INI AKAN berjalan untuk rute /api
     */
    '/((?!_next/static|_next/image|favicon.ico|placeholder.svg).*)',
  ],
};