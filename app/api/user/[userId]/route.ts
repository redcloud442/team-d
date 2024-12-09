import { loginRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import {
  protectionAdminUser,
  protectionMemberUser,
} from "@/utils/serversideProtection";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await context.params;
    const { email, password, iv } = await request.json();

    if (!password || !email || !userId) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

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

    await prisma.user_table.update({
      where: {
        user_id: userId,
      },
      data: {
        user_password: password,
        user_iv: iv,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
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

    await protectionAdminUser();

    loginRateLimit(ip);

    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "There is no user" }, { status: 400 });
    }

    await prisma.alliance_member_table.update({
      where: { alliance_member_id: userId }, // Changed to alliance_member_id
      data: {
        alliance_member_role: "MERCHANT",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      { status: 500 }
    );
  }
}
