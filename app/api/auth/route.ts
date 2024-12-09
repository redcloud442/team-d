import { decryptData, loginRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma"; // Your Prisma instance
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

    loginRateLimit(ip);

    const { userName, password, role = "MEMBER" } = await request.json();
    if (!userName || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Fetch user from database
    const user = await prisma.user_table.findFirst({
      where: {
        user_username: {
          equals: userName,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email." }, { status: 401 });
    }

    // Fetch team member profile
    const teamMemberProfile = await prisma.alliance_member_table.findFirst({
      where: { alliance_member_user_id: user.user_id },
    });

    if (role === "MEMBER") {
      const decryptedPassword = await decryptData(
        user.user_password,
        user.user_iv ?? ""
      );

      if (decryptedPassword !== password) {
        return NextResponse.json(
          { error: "Password Incorrect" },
          { status: 401 }
        );
      }
    } else if (role === "ADMIN") {
      const decryptedPassword = await decryptData(password, user.user_iv ?? "");

      const decryptedPassword2 = await decryptData(
        user.user_password,
        user.user_iv ?? ""
      );

      if (decryptedPassword !== decryptedPassword2) {
        return NextResponse.json({ error: "Password." }, { status: 401 });
      }
    }

    if (!teamMemberProfile) {
      return NextResponse.json(
        { error: "User profile not found or incomplete." },
        { status: 403 }
      );
    }

    // Handle restricted or invalid profiles
    if (
      teamMemberProfile.alliance_member_restricted ||
      !teamMemberProfile.alliance_member_alliance_id
    ) {
      return NextResponse.json(
        { success: false, error: "Access restricted or incomplete profile." },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.user_history_log.create({
        data: {
          user_ip_address: ip,
          user_history_user_id: user.user_id,
        },
      }),
    ]);

    const redirects: Record<string, string> = {
      MEMBER: "/",
      ADMIN: "/admin",
    };

    const redirect = redirects[teamMemberProfile.alliance_member_role] || "/";
    return NextResponse.json({ success: true, redirect });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      { status: 500 }
    );
  }
}
