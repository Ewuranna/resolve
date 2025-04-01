import { NextResponse } from 'next/server';
import { createClient } from './utils/supabase/middleware';

export async function middleware(request) {
  // Create a Supabase client configured to use cookies
  const { supabase, response } = createClient(request);
  
  // Refresh session if expired
  await supabase.auth.getSession();
  
  // Continue with the response
  return response;
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};