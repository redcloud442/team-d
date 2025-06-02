import { CompanyMemberRole } from "./enums";

export const PUBLIC_ROUTES = [
  "/login",
  "/register/",
  "/api/v1/auth",
  "/api/v1/auth/digiAuth",
  "/api/health",
  "/digiAuth",
];

export const PRIVATE_ROUTES = [
  "/digi-dash",
  "/api/v1/access",
  "/history",
  "/profile",
  "/request/withdraw",
  "/request/deposit",
  "/subscription",
  "/unilevel",
  "/referral",
  "/unilevel",
  "/change-password",
  "avail",
  "/logout",
];

export const ADMIN_ROUTES = ["/admin"];

export const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
};

export const isPrivateRoute = (pathname: string) => {
  return PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
};

export const isAdminRoute = (pathname: string) => {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
};

export const isMagicLink = (pathname: string) => {
  return pathname === "/callback";
};

export const isBypassRoute = (pathname: string) => {
  return pathname.startsWith("/api/v1/auth/register");
};

export const ROUTE_ROLE_REQUIREMENTS: {
  path: string;
  role?: CompanyMemberRole;
}[] = [
  { path: "/digi-dash" },
  { path: "/admin", role: CompanyMemberRole.ADMIN },
];
