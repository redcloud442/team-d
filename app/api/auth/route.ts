import { applyRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma"; // Your Prisma instance
import bcrypt from "bcrypt"; // Make sure to install bcrypt
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    if (ip) {
      applyRateLimit(ip);
    } else {
      throw new Error("Unable to determine IP address for rate limiting.");
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and Password are required" },
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

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.user_password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const teamMemberProfile = await prisma.alliance_member_table.findFirst({
      where: {
        alliance_member_user_id: user.user_id,
      },
    });

    if (!teamMemberProfile || !teamMemberProfile.alliance_member_alliance_id) {
      return NextResponse.json({ sureccess: false });
    }

    if (teamMemberProfile.alliance_member_role === "MEMBER") {
      return NextResponse.json({ success: true, redirect: "/" });
    } else if (teamMemberProfile.alliance_member_role === "ADMIN") {
      return NextResponse.json({ success: true, redirect: "/admin" });
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message, stack: error.stack },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred.", details: error },
      { status: 500 }
    );
  }
}
