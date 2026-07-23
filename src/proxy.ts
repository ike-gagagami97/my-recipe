import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/recipes";
const LOGIN_PATH = "/login";
const ROOT_PATH = "/";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If Supabase is not configured (e.g. local dev without .env.local),
  // redirect root → /login and pass through everything else.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (pathname === ROOT_PATH) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = LOGIN_PATH;
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
  }

  // Pass through static assets and Next.js internals
  // (The matcher below already filters these, but kept as defense-in-depth)

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() verifies the JWT with Supabase and refreshes the session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  const isRootOrProtected =
    pathname === ROOT_PATH || pathname.startsWith(PROTECTED_PREFIX);
  const isRootOrLogin =
    pathname === ROOT_PATH || pathname === LOGIN_PATH;

  // Unauthenticated: root or protected route → /login
  if (!isAuthenticated && isRootOrProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated: root or /login → /recipes
  if (isAuthenticated && isRootOrLogin) {
    const recipesUrl = request.nextUrl.clone();
    recipesUrl.pathname = PROTECTED_PREFIX;
    return NextResponse.redirect(recipesUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
