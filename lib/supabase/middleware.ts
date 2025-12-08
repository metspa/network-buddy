import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Note: Supabase SSR auth refresh is not compatible with Edge Runtime
  // Auth is handled by the callback route and client-side session management
  return NextResponse.next({
    request,
  })
}
