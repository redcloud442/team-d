import { escapeFormData } from "@/utils/function";
import { rateLimit } from "@/utils/redis/redis";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const { teamMemberProfile } = await protectionMemberUser(ip);

    const isAllowed = await rateLimit(
      `rate-limit:${teamMemberProfile}`,
      50,
      60
    );

    if (!isAllowed) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const supabaseClient = await createClientServerSide();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const page = url.searchParams.get("page") || 1;
    const limit = url.searchParams.get("limit") || 10;
    const sortBy = url.searchParams.get("sortBy") || true;
    const columnAccessor = url.searchParams.get("columnAccessor") || "";
    const isAscendingSort = url.searchParams.get("isAscendingSort") || true;
    const teamMemberId = url.searchParams.get("teamMemberId") || "";

    const params = {
      search,
      page,
      limit,
      sortBy,
      columnAccessor,
      isAscendingSort: isAscendingSort,
      teamId: teamMemberProfile?.alliance_member_alliance_id || "",
      teamMemberId: teamMemberId
        ? teamMemberId
        : teamMemberProfile?.alliance_member_id,
    };

    const escapedParams = escapeFormData(params);

    if (limit !== "10") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { data, error } = await supabaseClient.rpc(
      "get_member_top_up_history",
      {
        input_data: escapedParams,
      }
    );

    if (error) throw error;

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
