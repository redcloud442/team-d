import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) {
    redirect("/login");
  }

  const profile = await prisma.user_table.findUnique({
    where: { user_id: data.session.user.id },
  });

  if (profile?.user_role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main>
      <h1 className="text-2xl text-center mb-8">Admin page</h1>
      <pre>{JSON.stringify({ profile }, null, 4)}</pre>
    </main>
  );
}
