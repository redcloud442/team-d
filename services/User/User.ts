import { escapeFormData } from "@/utils/function";
import prisma from "@/utils/prisma";
import { alliance_earnings_table } from "@prisma/client";

export const getEarnings = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user`, {
    method: "GET",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the earnings."
    );
  }

  const { data } = result;

  return data as alliance_earnings_table;
};

export const getUserSponsor = async (params: {
  teamMemberId: string;
  userId?: string;
}) => {
  try {
    const sanitizedData = escapeFormData(params);
    let userSponsor;
    if (!sanitizedData.userId) {
      userSponsor = await prisma.$queryRawUnsafe(
        `
      SELECT 
        ut.user_username
      FROM alliance_schema.alliance_referral_table art
      JOIN alliance_schema.alliance_member_table am 
        ON am.alliance_member_id = art.alliance_referral_from_member_id
      JOIN user_schema.user_table ut
        ON ut.user_id = am.alliance_member_user_id
      WHERE art.alliance_referral_member_id = $1
      `,
        sanitizedData.teamMemberId
      );
    } else {
      userSponsor = await prisma.$queryRawUnsafe(
        `
      SELECT 
        ut.user_username
      FROM user_schema.user_table ut
      WHERE ut.user_id = $1
      `,
        sanitizedData.userId
      );
    }

    // Ensure data exists and handle the response
    if (!userSponsor) {
      return null;
    }
    return {
      user_username: (userSponsor as any[])[0]?.user_username, // Return the first result's username
    };
  } catch (e) {
    return null; // Handle errors gracefully
  }
};
