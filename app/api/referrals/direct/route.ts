import { applyRateLimit } from "@/utils/function";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const { teamMemberProfile } = await protectionMemberUser();

    await applyRateLimit(teamMemberProfile?.alliance_member_id || "", ip);

    const url = new URL(request.url);

    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");
    const search = url.searchParams.get("search");
    const columnAccessor = url.searchParams.get("columnAccessor");
    const isAscendingSort = url.searchParams.get("isAscendingSort");

    const supabaseClient = await createClientServerSide();

    const params = {
      page: Number(page),
      limit: Number(limit),
      search: search || "",
      columnAccessor: columnAccessor || "",
      isAscendingSort: isAscendingSort === "true",
      teamMemberId: teamMemberProfile?.alliance_member_id || "",
      teamId: teamMemberProfile?.alliance_member_alliance_id || "",
    };

    const { data, error } = await supabaseClient.rpc("get_ally_bounty", {
      input_data: params,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data });
  } catch (e) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
