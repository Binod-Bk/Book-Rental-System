import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require a logged-in user
const PROTECTED_USER_ROUTES = ['/dashboard']

// Routes that require admin role (/admin/login is excluded — it's public)
const PROTECTED_ADMIN_ROUTES = ['/admin']
const PUBLIC_ADMIN_ROUTES = ['/admin/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  // /admin/login is public — skip all checks
  if (PUBLIC_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) return response

  const isUserRoute = PROTECTED_USER_ROUTES.some((r) => pathname.startsWith(r))
  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some((r) => pathname.startsWith(r))

  if (!isUserRoute && !isAdminRoute) return response

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Admin routes redirect to /admin/login, user routes to /login
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
