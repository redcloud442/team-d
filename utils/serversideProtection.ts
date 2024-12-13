import { logError } from "@/services/Error/ErrorLogs";
import {
  alliance_earnings_table,
  alliance_member_table,
  alliance_referral_link_table,
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

export const refreshSession = async () => {
  const supabase = await createClientServerSide();
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    if (error instanceof Error) {
      await logError(supabase, {
        errorMessage: error.message,
        stackTrace: error.stack,
        stackPath: "utils/serversideProtection.ts",
      });
    }
    return false;
  }
  if (data) {
    return true;
  }
};

export const ensureValidSession = async () => {
  const supabase = await createClientServerSide();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return false;
  }
  if (session.expires_at && session.expires_at * 1000 < Date.now() + 60000) {
    return await refreshSession();
  }
  return true;
};

export const protectionAdminUser = async () => {
  try {
    const supabase = await createClientServerSide();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return { redirect: "/auth/login" };
    }

    const userId = authData.user.id;

    const [profile, teamMember] = await Promise.all([
      prisma.user_table.findUnique({ where: { user_id: userId } }),
      prisma.alliance_member_table.findFirst({
        where: { alliance_member_user_id: userId },
      }),
    ]);

    if (!profile || !teamMember) {
      return { redirect: "/500" };
    }

    const validRoles = new Set(["ADMIN"]);
    if (
      !teamMember.alliance_member_alliance_id ||
      !validRoles.has(teamMember.alliance_member_role) ||
      teamMember.alliance_member_restricted
    ) {
      return { redirect: "/500" };
    }
    const referral = await prisma.alliance_referral_link_table.findFirst({
      where: {
        alliance_referral_link_member_id: teamMember.alliance_member_id,
      },
    });

    if (!referral) {
      return { redirect: "/500" };
    }
    return {
      profile: profile as user_table,
      teamMemberProfile: teamMember as alliance_member_table,
      referral: referral as alliance_referral_link_table,
    };
  } catch (error) {
    return { redirect: "/error" };
  }
};

export const protectionMemberUser = async () => {
  const supabase = await createClientServerSide();

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return { redirect: "/auth/login" };
    }

    const userId = authData.user.id;

    const [profile, teamMember] = await Promise.all([
      prisma.user_table.findUnique({ where: { user_id: userId } }),
      prisma.alliance_member_table.findFirst({
        where: { alliance_member_user_id: userId },
      }),
    ]);

    if (!profile) {
      return { redirect: "/500" };
    }

    if (
      !teamMember?.alliance_member_alliance_id ||
      !["MEMBER", "MERCHANT", "ACCOUNTING", "ADMIN"].includes(
        teamMember.alliance_member_role
      )
    ) {
      return { redirect: "/404" };
    }

    if (teamMember.alliance_member_restricted) {
      return { redirect: "/500" };
    }

    const [referal, earnings] = await Promise.all([
      prisma.alliance_referral_link_table.findFirst({
        where: {
          alliance_referral_link_member_id: teamMember.alliance_member_id,
        },
      }),
      prisma.alliance_earnings_table.findFirst({
        where: { alliance_earnings_member_id: teamMember.alliance_member_id },
      }),
    ]);

    if (!earnings) {
      return { redirect: "/404" };
    }

    return {
      profile: profile as user_table,
      teamMemberProfile: teamMember as alliance_member_table,
      earnings: earnings as alliance_earnings_table,
      referal: referal as alliance_referral_link_table,
    };
  } catch (e) {
    if (e instanceof Error) {
      await logError(supabase, {
        errorMessage: e.message,
        stackTrace: e.stack,
        stackPath: "utils/serversideProtection.ts",
      });
    }
    return { redirect: "/500" };
  }
};

export const protectionMerchantUser = async () => {
  const supabase = await createClientServerSide();
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return { redirect: "/auth/login" };
    }

    const userId = authData.user.id;

    const [profile, teamMember] = await Promise.all([
      prisma.user_table.findUnique({ where: { user_id: userId } }),
      prisma.alliance_member_table.findFirst({
        where: { alliance_member_user_id: userId },
      }),
    ]);

    if (!profile) {
      return { redirect: "/500" };
    }

    if (
      !teamMember?.alliance_member_alliance_id ||
      !["MERCHANT", "ADMIN"].includes(teamMember.alliance_member_role)
    ) {
      return { redirect: "/404" };
    }

    if (teamMember.alliance_member_restricted) {
      return { redirect: "/500" };
    }

    const [referal, earnings] = await Promise.all([
      prisma.alliance_referral_link_table.findFirst({
        where: {
          alliance_referral_link_member_id: teamMember.alliance_member_id,
        },
      }),
      prisma.alliance_earnings_table.findFirst({
        where: { alliance_earnings_member_id: teamMember.alliance_member_id },
      }),
    ]);

    if (!earnings) {
      return { redirect: "/404" };
    }

    return {
      profile: profile as user_table,
      teamMemberProfile: teamMember as alliance_member_table,
      earnings: earnings as alliance_earnings_table,
      referal: referal as alliance_referral_link_table,
    };
  } catch (e) {
    if (e instanceof Error) {
      await logError(supabase, {
        errorMessage: e.message,
        stackTrace: e.stack,
        stackPath: "utils/serversideProtection.ts",
      });
    }
    return { redirect: "/500" };
  }
};

export const protectionAccountingUser = async () => {
  const supabase = await createClientServerSide();
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return { redirect: "/auth/login" };
    }

    const userId = authData.user.id;

    const [profile, teamMember] = await Promise.all([
      prisma.user_table.findUnique({ where: { user_id: userId } }),
      prisma.alliance_member_table.findFirst({
        where: { alliance_member_user_id: userId },
      }),
    ]);

    if (!profile) {
      return { redirect: "/500" };
    }

    if (
      !teamMember?.alliance_member_alliance_id ||
      !["ADMIN", "ACCOUNTING"].includes(teamMember.alliance_member_role)
    ) {
      return { redirect: "/404" };
    }

    if (teamMember.alliance_member_restricted) {
      return { redirect: "/500" };
    }

    const [referal, earnings] = await Promise.all([
      prisma.alliance_referral_link_table.findFirst({
        where: {
          alliance_referral_link_member_id: teamMember.alliance_member_id,
        },
      }),
      prisma.alliance_earnings_table.findFirst({
        where: { alliance_earnings_member_id: teamMember.alliance_member_id },
      }),
    ]);

    if (!earnings) {
      return { redirect: "/404" };
    }

    return {
      profile: profile as user_table,
      teamMemberProfile: teamMember as alliance_member_table,
      earnings: earnings as alliance_earnings_table,
      referal: referal as alliance_referral_link_table,
    };
  } catch (e) {
    if (e instanceof Error) {
      await logError(supabase, {
        errorMessage: e.message,
        stackTrace: e.stack,
        stackPath: "utils/serversideProtection.ts",
      });
    }
    return { redirect: "/500" };
  }
};

export const protectionAllUser = async () => {
  const supabase = await createClientServerSide();
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return { redirect: "/auth/login" };
    }

    const userId = authData.user.id;

    const [profile, teamMember] = await Promise.all([
      prisma.user_table.findUnique({ where: { user_id: userId } }),
      prisma.alliance_member_table.findFirst({
        where: { alliance_member_user_id: userId },
      }),
    ]);

    if (!profile) {
      return { redirect: "/500" };
    }

    if (
      !teamMember?.alliance_member_alliance_id ||
      !["MEMBER", "MERCHANT", "ACCOUNTING", "ADMIN"].includes(
        teamMember.alliance_member_role
      )
    ) {
      return { redirect: "/404" };
    }

    if (teamMember.alliance_member_restricted) {
      return { redirect: "/500" };
    }

    const [referal, earnings] = await Promise.all([
      prisma.alliance_referral_link_table.findFirst({
        where: {
          alliance_referral_link_member_id: teamMember.alliance_member_id,
        },
      }),
      prisma.alliance_earnings_table.findFirst({
        where: { alliance_earnings_member_id: teamMember.alliance_member_id },
      }),
    ]);

    if (!earnings) {
      return { redirect: "/404" };
    }

    return {
      profile: profile as user_table,
      teamMemberProfile: teamMember as alliance_member_table,
      earnings: earnings as alliance_earnings_table,
      referal: referal as alliance_referral_link_table,
    };
  } catch (e) {
    if (e instanceof Error) {
      await logError(supabase, {
        errorMessage: e.message,
        stackTrace: e.stack,
        stackPath: "utils/serversideProtection.ts",
      });
    }
    return { redirect: "/500" };
  }
};
