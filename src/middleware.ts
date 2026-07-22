import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Gates /admin/*, and refreshes the Supabase session cookie on every request.
 *
 * This layer checks only that a SESSION exists. The allow-list check (an active
 * admin_users row) happens in the (console) layout, which can use the
 * service-role client: RLS denies the anon key every table by design, so an
 * admin_users lookup from here would return nothing and lock out real admins.
 *
 * Defence in depth, not the only lock. Middleware covers page navigations;
 * every /api/admin/* handler calls requireAdmin() independently.
 */
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always call getUser() so the session cookie is refreshed on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!pathname.startsWith("/admin") || isPublicAdminPath(pathname)) {
    // Already signed in and heading for the login screen? Go to the console.
    if (isPublicAdminPath(pathname) && user) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return response;
  }

  if (!user?.email) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authorisation (the active admin_users row) is enforced by the (console)
  // layout, which has the service-role client needed to read past RLS.
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
