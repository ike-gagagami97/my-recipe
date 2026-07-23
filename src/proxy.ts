import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/recipes";
const LOGIN_PATH = "/login";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If Supabase is not configured (e.g. local dev without .env.local),
  // skip auth checks and pass through all requests.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
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

  // Unauthenticated user trying to reach a protected route → /login
  if (!isAuthenticated && pathname.startsWith(PROTECTED_PREFIX)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting /login → /recipes
  if (isAuthenticated && pathname === LOGIN_PATH) {
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
