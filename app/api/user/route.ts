import { loginRateLimit } from "@/utils/function";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function PUT(request: Request) {
  try {
    // Extract and validate IP address
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

    await protectionMemberUser();

    loginRateLimit(ip);

    const { email, password, userId } = await request.json();

    if (!password || !email || !userId) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Fetch user from database
    const user = await prisma.user_table.findFirst({
      where: {
        user_email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    const teamMemberProfile = await prisma.alliance_member_table.findFirst({
      where: { alliance_member_user_id: user?.user_id },
    });

    if (!teamMemberProfile) {
      return NextResponse.json(
        { error: "User profile not found or incomplete." },
        { status: 403 }
      );
    }

    if (
      teamMemberProfile.alliance_member_restricted ||
      !teamMemberProfile.alliance_member_alliance_id
    ) {
      return NextResponse.json(
        { success: false, error: "Access restricted or incomplete profile." },
        { status: 403 }
      );
    }

    prisma.user_table.update({
      where: {
        user_id: userId,
      },
      data: {
        user_password: password,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      { status: 500 }
    );
  }
}
