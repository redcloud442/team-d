import { PrismaClient } from "@prisma/client";

import { createClientServerSide } from "./supabase/server";

const prisma = new PrismaClient();

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
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      return { redirect: "/auth/login" };
    }

    const profile = await prisma.user_table.findUnique({
      where: { user_id: data.user.id },
    });

    if (profile?.user_role !== "ADMIN") {
      return { redirect: "/500" };
    }

    return {
      profile,
    };
  } catch (e) {
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

    if (profile?.user_role !== "MEMBER" && profile?.user_role !== "ADMIN") {
      return { redirect: "/500" };
    }

    return {
      profile,
    };
  } catch (e) {
    return { redirect: "/error" };
  }
};
