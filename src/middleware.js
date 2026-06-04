// src/middleware.js
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/']
const ADMIN_ROUTES  = ['/dashboard/admin', '/dashboard/laporan', '/dashboard/users', '/dashboard/kategori', '/dashboard/komentar', '/dashboard/profile']
const SUPER_ROUTES  = ['/dashboard/superadmin']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value
  const role  = request.cookies.get('role')?.value

  // Not logged in → redirect to login (except public routes)
  if (!token && !PUBLIC_ROUTES.some(r => pathname === r)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in → don't allow visiting login/register
  if (token && (pathname === '/login' || pathname === '/register')) {
    if (role === 'super_admin') return NextResponse.redirect(new URL('/dashboard/superadmin', request.url))
    if (role === 'admin')       return NextResponse.redirect(new URL('/dashboard/admin', request.url))
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
