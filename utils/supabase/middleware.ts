import { CompanyMemberRole, RouteAction } from "@/utils/enums";
import {
  isAdminRoute,
  isBypassRoute,
  isMagicLink,
  isPrivateRoute,
  isPublicRoute,
} from "@/utils/routeMatcher";
import { createServerClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const cookieStore = await cookies();
  const pathname = request.nextUrl.pathname;

  if (request.headers.get("x-session-checked")) {
    return addSecurityHeaders(NextResponse.next());
  }

  if (isBypassRoute(pathname)) {
    return NextResponse.next();
  }

  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, sameSite: true })
            );
          } catch {
            // Ignore if called from Server Component.
          }
        },
      },
    }
  );

  if (isMagicLink(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const action = determineRouteAction({
    user,
    role: user?.user_metadata.Role,
    pathname,
  });

  switch (action) {
    case RouteAction.ALLOW:
      supabaseResponse.headers.set("x-session-checked", "true");
      return addSecurityHeaders(supabaseResponse);

    case RouteAction.REDIRECT_LOGIN: {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    case RouteAction.REDIRECT_DASHBOARD: {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/digi-dash";
      return addSecurityHeaders(NextResponse.redirect(homeUrl));
    }

    case RouteAction.REDIRECT_ADMIN: {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      return addSecurityHeaders(NextResponse.redirect(adminUrl));
    }

    case RouteAction.FORBIDDEN:
      return addSecurityHeaders(
        NextResponse.redirect(new URL("/", request.url))
      );

    default:
      return addSecurityHeaders(NextResponse.next());
  }
}

type RouteActionParams = {
  user: User | null;
  role: CompanyMemberRole | null;
  pathname: string;
};

const determineRouteAction = ({
  user,
  role,
  pathname,
}: RouteActionParams): RouteAction => {
  if (!user) {
    if (isPublicRoute(pathname)) return RouteAction.ALLOW;

    if (isPrivateRoute(pathname) || isAdminRoute(pathname))
      return RouteAction.REDIRECT_LOGIN;

    return RouteAction.REDIRECT_LOGIN;
  }

  // 🟡 REDIRECT ADMIN USERS FROM /digi-dash TO /admin
  if (pathname === "/digi-dash" && role === CompanyMemberRole.ADMIN) {
    return RouteAction.REDIRECT_ADMIN;
  }

  // Non-admin users visiting public route (e.g. `/`)
  if (isPublicRoute(pathname)) {
    if (pathname !== "/digi-dash") return RouteAction.REDIRECT_DASHBOARD;
  }

  if (isPrivateRoute(pathname)) {
    if (role !== CompanyMemberRole.ADMIN) {
      return RouteAction.ALLOW;
    } else {
      return RouteAction.FORBIDDEN;
    }
  }

  if (isAdminRoute(pathname) && role !== CompanyMemberRole.ADMIN) {
    return RouteAction.FORBIDDEN;
  }

  return RouteAction.ALLOW;
};

const addSecurityHeaders = (response: NextResponse) => {
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
};
