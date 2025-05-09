import prisma from "@/utils/prisma"; // OK here
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  const member = await prisma.company_member_table.findFirst({
    where: { company_member_user_id: userId ?? undefined },
    select: { company_member_role: true },
  });

  return NextResponse.json({ role: member?.company_member_role || null });
}
