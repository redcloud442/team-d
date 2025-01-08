import { loginRateLimit } from "@/utils/function";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  loginRateLimit(ip);
  return NextResponse.json({ status: "OK" }, { status: 200 });
}
