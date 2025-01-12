import { loginRateLimit } from "@/utils/function";
import { protectionAllUser } from "@/utils/serversideProtection";
import { createClientSide } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    if (ip === "unknown") {
      return NextResponse.json(
        { error: "Unable to determine IP address for rate limiting." },
        { status: 400 }
      );
    }

    const { userId } = await request.json();
    const supabaseClient = createClientSide();

    await protectionAllUser(ip);

    loginRateLimit(ip);
    const { data: userData, error } = await supabaseClient.rpc(
      "get_user_sponsor",
      {
        input_data: { userId },
      }
    );

    if (error) {
      throw new Error(error.message);
    }
    const { data } = userData;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
