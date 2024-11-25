import {
  alliance_earnings_table,
  alliance_member_table,
  user_table,
} from "@prisma/client";
import prisma from "./prisma";
import { createClientServerSide } from "./supabase/server";

export const protectionRegisteredUser = async () => {
  const supabase = await createClientServerSide();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return { redirect: "/" };
  }
};

export const protectionAdminUser = async () => {
  try {
    const supabase = await createClientServerSide();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return { redirect: "/auth/login" };
    }

    const userId = data.user.id;

    // Fetch the user profile
    const profile = await prisma.user_table.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return { redirect: "/500" }; // Redirect if the profile is not found
    }

    // Check if the user is an admin in the alliance
    const teamMember = await prisma.alliance_member_table.findFirst({
      where: { alliance_member_user_id: profile.user_id },
    });

    if (
      !teamMember?.alliance_member_alliance_id ||
      teamMember.alliance_member_role !== "ADMIN"
    ) {
      return { redirect: "/500" };
    }

    if (teamMember.alliance_member_restricted) {
      return { redirect: "/500" };
    }

    return {
      profile: profile as user_table,
      teamMemberProfile: teamMember as alliance_member_table,
    };
  } catch (e) {
    console.error("Error in protectionAdminUser:", e);
    return { redirect: "/error" };
  }
};

export const protectionMemberUser = async () => {
  try {
    const supabase = await createClientServerSide();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      return { redirect: "/auth/login" };
    }

    const profile = await prisma.user_table.findUnique({
      where: { user_id: data.user.id },
    });

    if (!profile) return { redirect: "/500" };

    const teamMember = await prisma.alliance_member_table.findFirst({
      where: { alliance_member_user_id: profile.user_id },
    });

    if (
      !teamMember?.alliance_member_alliance_id ||
      (teamMember.alliance_member_role !== "MEMBER" &&
        teamMember.alliance_member_role !== "ADMIN")
    ) {
      return { redirect: "/404" };
    }

    if (teamMember.alliance_member_restricted) {
      return { redirect: "/500" };
    }

    const earnings = await prisma.alliance_earnings_table.findFirst({
      where: { alliance_earnings_member_id: teamMember.alliance_member_id },
    });

    if (!earnings) {
      return { redirect: "/404" };
    }

    return {
      profile: profile as user_table,
      teamMemberProfile: teamMember as alliance_member_table,
      earnings: earnings as alliance_earnings_table,
    };
  } catch (e) {
    console.log(e);

    return { redirect: "/error" };
  }
};
