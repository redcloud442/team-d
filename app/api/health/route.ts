import { rateLimit } from "@/utils/redis/redis";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  const isAllowed = await rateLimit(`rate-limit:${ip}`, 5, 60);

  if (!isAllowed) {
    return NextResponse.json({ success: false, ip });
  }

  return NextResponse.json({ status: "OK" }, { status: 200 });
}
