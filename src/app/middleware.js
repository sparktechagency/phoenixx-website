import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Define paths that require authentication
  const protectedPaths = ['/dashboard', '/profile', '/settings']
  
  // Check if path requires authentication
  const isPathProtected = protectedPaths.some((path) => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  // Check if user is authenticated (e.g., by checking for an auth token)
  const token = localStorage.getItem('loginToken');
  const isAuthenticated = !!token
  
  // If the path is protected and the user isn't authenticated, redirect to login
  if (isPathProtected && !isAuthenticated) {
    const url = new URL('/login', request.url)
    // Forward the original path so we can redirect after login
    url.searchParams.set('from', path)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

// Configure which paths the middleware runs on (optional)
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*'],
}
