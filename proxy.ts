import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In Next.js 16, the middleware file convention is renamed to proxy.ts
// and the exported function is named `proxy` instead of `middleware`.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Create a server-side Supabase client that can read/write cookies.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Forward updated cookies into the request so subsequent
          // server code sees them.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: use getUser() — not getSession() — for authorization decisions.
  // getSession() reads unverified data from cookies; getUser() contacts the
  // Supabase Auth server and returns the verified user record.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const adminEmail = process.env.ADMIN_EMAIL;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // --- Protect all /admin routes except /admin/login ---
  if (isAdminRoute && !isLoginPage) {
    const isAuthenticated = !!user && user.email === adminEmail;
    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      if (user && user.email !== adminEmail) {
        loginUrl.searchParams.set("error", "unauthorized");
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Redirect away from login page if already authenticated ---
  if (isLoginPage && user && user.email === adminEmail) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    return NextResponse.redirect(adminUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
