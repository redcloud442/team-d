"use server";

import { applyRateLimitMember } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";

export const claimPackage = async (params: {
  packageConnectionId: string;
  amount: number;
}) => {
  try {
    const { packageConnectionId, amount } = params;

    if (!packageConnectionId || !amount) {
      throw new Error("Missing required fields in the request body.");
    }

    const { teamMemberProfile } = await protectionMemberUser();
    if (!teamMemberProfile) {
      throw new Error("User authentication failed.");
    }

    await applyRateLimitMember(teamMemberProfile.alliance_member_id);

    const packageConnection =
      await prisma.package_member_connection_table.findUnique({
        where: { package_member_connection_id: packageConnectionId },
      });

    if (!packageConnection) {
      throw new Error("Package connection not found.");
    }

    if (packageConnection.package_member_status === "ENDED") {
      throw new Error("Invalid request. Package already ended.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.package_member_connection_table.update({
        where: { package_member_connection_id: packageConnectionId },
        data: { package_member_status: "ENDED" },
      });

      await tx.alliance_earnings_table.update({
        where: {
          alliance_earnings_member_id: teamMemberProfile.alliance_member_id,
        },
        data: {
          alliance_olympus_earnings: { increment: amount },
        },
      });

      await tx.package_earnings_log.create({
        data: {
          package_member_connection_id: packageConnectionId,
          package_member_package_id:
            packageConnection.package_member_package_id,
          package_member_member_id: teamMemberProfile.alliance_member_id,
          package_member_connection_created:
            packageConnection.package_member_connection_created,
          package_member_amount: packageConnection.package_member_amount,
          package_member_amount_earnings: amount,
          package_member_status: "ENDED",
        },
      });
    });

    return { success: true };
  } catch (error) {
    throw new Error("Internal server error");
  }
};
