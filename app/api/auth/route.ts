import { loginRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma"; // Your Prisma instance
import bcrypt from "bcrypt"; // Ensure bcrypt is installed
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Extract and validate IP address
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    if (ip === "unknown") {
      return NextResponse.json(
        { error: "Unable to determine IP address for rate limiting." },
        { status: 400 }
      );
    }

    loginRateLimit(ip); // Rate limit by IP

    // Parse and validate request body
    const { email, password } = await request.json();
    if (!email || !password) {
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

    if (!user || !(await bcrypt.compare(password, user.user_password))) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Fetch team member profile
    const teamMemberProfile = await prisma.alliance_member_table.findFirst({
      where: { alliance_member_user_id: user.user_id },
    });

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

    // Determine redirect based on user role
    const redirects: Record<string, string> = {
      MEMBER: "/",
      ADMIN: "/admin",
    };

    const redirect = redirects[teamMemberProfile.alliance_member_role] || "/";
    return NextResponse.json({ success: true, redirect });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      { status: 500 }
    );
  }
}
