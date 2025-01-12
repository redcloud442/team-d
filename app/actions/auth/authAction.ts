"use server";

import { applyRateLimitMember } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import {
  createClientServerSide,
  createServiceRoleClientServerSide,
} from "@/utils/supabase/server";
import crypto from "crypto";
import { NextResponse } from "next/server";

export const changeUserPassword = async (params: {
  email: string;
  userId: string;
  password: string;
}) => {
  const { email, password, userId } = params;

  const { teamMemberProfile: role } = await protectionMemberUser();

  applyRateLimitMember(role?.alliance_member_id || "");

  const iv = crypto.randomBytes(16);
  const allowedKey = process.env.ALLOWED_CRYPTO_KEY;

  if (!allowedKey) {
    throw new Error("CRYPTO_SECRET_KEY is not defined");
  }

  if (allowedKey.length !== 64) {
    throw new Error(
      "CRYPTO_SECRET_KEY must be a 32-byte (64 characters) hex string"
    );
  }

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(allowedKey, "hex"),
    iv
  );

  let encrypted = cipher.update(password, "utf-8", "hex");
  encrypted += cipher.final("hex");

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

  await prisma.$transaction(async (tx) => {
    await tx.user_table.update({
      where: {
        user_id: userId,
      },
      data: {
        user_password: encrypted,
        user_iv: iv.toString("hex"),
      },
    });
  });

  if (role?.alliance_member_role !== "ADMIN") {
    const supabaseClient = await createClientServerSide();
    const { error } = await supabaseClient.auth.updateUser({
      email: email,
      password: password,
    });
    if (error) {
      console.log(error);

      throw new Error("Failed to update user password");
    }
  } else {
    const supabaseClient = await createServiceRoleClientServerSide();
    await supabaseClient.auth.admin.updateUserById(userId, {
      password: password,
    });
  }
};
