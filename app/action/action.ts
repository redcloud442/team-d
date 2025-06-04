"use server";

import { createClientServerSide } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

export async function revalidateCache({ path }: { path: string }) {
  const supabase = await createClientServerSide();
  const { data } = await supabase.auth.getUser();

  if (!data) {
    throw new Error("User not found");
  }

  revalidateTag(path);
}
