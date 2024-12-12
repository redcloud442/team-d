import { applyRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const supabase = await createClientServerSide();

    const formData = await request.formData();
    const amount = formData.get("amount")?.toString();
    const topUpMode = formData.get("topUpMode")?.toString();
    const accountName = formData.get("accountName")?.toString();
    const accountNumber = formData.get("accountNumber")?.toString();
    const file = formData.get("file") as File | null;
    const teamMemberId = formData.get("teamMemberId")?.toString();

    if (
      !amount ||
      !topUpMode ||
      !accountName ||
      !accountNumber ||
      !file ||
      !teamMemberId
    ) {
      return NextResponse.json(
        {
          error: "All fields are required.",
        },
        { status: 400 }
      );
    }
    if (amount.length > 7 || amount.length < 3) {
      return NextResponse.json(
        {
          error: "Amount must be less than 6 digits.",
        },
        { status: 400 }
      );
    }
    await protectionMemberUser();

    await applyRateLimit(teamMemberId, ip);

    const { error: uploadError } = await supabase.storage
      .from("REQUEST_ATTACHMENTS")
      .upload(file.name, file, { upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError }, { status: 500 });
    }

    const { data: publicUrlResponse } = supabase.storage
      .from("REQUEST_ATTACHMENTS")
      .getPublicUrl(file.name);

    const fileUrl = publicUrlResponse?.publicUrl;

    const allianceData = await prisma.alliance_top_up_request_table.create({
      data: {
        alliance_top_up_request_amount: Number(amount),
        alliance_top_up_request_type: topUpMode,
        alliance_top_up_request_name: accountName,
        alliance_top_up_request_account: String(accountNumber),
        alliance_top_up_request_attachment: fileUrl,
        alliance_top_up_request_member_id: teamMemberId,
      },
    });

    if (!allianceData) {
      return NextResponse.json(
        { error: "Failed to create top-up request. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
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
