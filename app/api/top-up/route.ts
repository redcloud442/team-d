import { applyRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Retrieve the IP address
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const supabase = await createClientServerSide();

    const formData = await request.formData();

    const {
      amount,
      topUpMode,
      accountName,
      accountNumber,
      file,
      teamMemberId,
    } = Object.fromEntries(formData) as {
      amount?: string;
      topUpMode?: string;
      accountName?: string;
      accountNumber?: string;
      file?: File;
      teamMemberId?: string;
    };
    if (
      !amount ||
      !topUpMode ||
      !accountName ||
      !accountNumber ||
      !file ||
      !teamMemberId
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (amount.length > 7 || amount.length < 3) {
      return NextResponse.json(
        { error: "Amount must be between 3 and 7 digits." },
        { status: 400 }
      );
    }

    await protectionMemberUser(ip);
    await applyRateLimit(teamMemberId, ip);

    const filePath = `uploads/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("REQUEST_ATTACHMENTS")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { error: "File upload failed.", details: uploadError.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("REQUEST_ATTACHMENTS").getPublicUrl(filePath);

    try {
      const allianceData = await prisma.$transaction(async (tx) => {
        return await tx.alliance_top_up_request_table.create({
          data: {
            alliance_top_up_request_amount: Number(amount),
            alliance_top_up_request_type: topUpMode,
            alliance_top_up_request_name: accountName,
            alliance_top_up_request_account: accountNumber,
            alliance_top_up_request_attachment: publicUrl,
            alliance_top_up_request_member_id: teamMemberId,
          },
        });
      });

      return NextResponse.json({ success: true, data: allianceData });
    } catch (dbError) {
      await supabase.storage.from("REQUEST_ATTACHMENTS").remove([filePath]);
      return NextResponse.json(
        { error: "Database operation failed. File upload rolled back." },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
