import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ensureValidSession } from "../serversideProtection";

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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  await ensureValidSession();

  const publicRoutes = ["/auth/login", "/auth/register", "/api/auth"];
  const privateRoutes = ["/", "/dashboard", "/api/auth", "/admin"];
  const currentPath = request.nextUrl.pathname;
  //   const { data: profile } = await supabase
  //   .schema("alliance_schema")
  //   .from("alliance_member_table")
  //   .select("alliance_member_role")
  //   .eq("alliance_member_user_id", user.id)
  //   .single();

  // role = profile?.alliance_member_role;
  // }
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

  if (user) {
    if (publicRoutes.some((route) => currentPath.startsWith(route))) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}
