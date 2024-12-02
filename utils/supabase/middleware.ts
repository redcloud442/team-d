import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicRoutes = ["/auth/login", "/auth/register"];
  const privateRoutes = ["/", "/dashboard"];
  const openRoutes = ["/api/auth"]; // Open to both authenticated and unauthenticated users
  const currentPath = request.nextUrl.pathname;

  // Always allow openRoutes
  if (openRoutes.some((route) => currentPath.startsWith(route))) {
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!user) {
    if (publicRoutes.some((route) => currentPath.startsWith(route))) {
      return NextResponse.next();
    }

    if (privateRoutes.some((route) => currentPath.startsWith(route))) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle authenticated users
  if (user) {
    if (publicRoutes.some((route) => currentPath.startsWith(route))) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  // Default case: allow authenticated users to access private routes
  return NextResponse.next();
}
