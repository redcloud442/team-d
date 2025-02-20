import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const cookieStore = await cookies();
  // Check if the session validation has already occurred
  if (request.headers.get("x-session-checked")) {
    return addSecurityHeaders(NextResponse.next());
  }

  if (request.nextUrl.pathname.startsWith("/api/v1/auth/register")) {
    return NextResponse.next();
  }

  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, sameSite: true })
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const isMagicLinkCallback = request.nextUrl.pathname === "/auth/callback";

  if (isMagicLinkCallback) {
    return addSecurityHeaders(NextResponse.next());
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/api/v1/auth",
    "/auth/securedPrime",
    "/api/health",
    "/",
  ];
  const privateRoutes = [
    "/dashboard",
    "/api/auth",
    "/admin",
    "/api/health",
    "/dashboard",
  ];
  const currentPath = request.nextUrl.pathname;

  if (!user) {
    if (publicRoutes.some((route) => currentPath.startsWith(route))) {
      return addSecurityHeaders(NextResponse.next());
    }

    if (privateRoutes.some((route) => currentPath.startsWith(route))) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      const response = NextResponse.redirect(loginUrl);
      response.headers.set("x-session-checked", "true");
      return addSecurityHeaders(response);
    }
  }

  if (user) {
    if (publicRoutes.some((route) => currentPath.startsWith(route))) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/dashboard";
      const response = NextResponse.redirect(homeUrl);
      response.headers.set("x-session-checked", "true");
      return addSecurityHeaders(response);
    }
  }

  supabaseResponse.headers.set("x-session-checked", "true");
  return addSecurityHeaders(supabaseResponse);
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
}
