import LoginDataPage from "@/components/loginPage/loginPage";
import { createClientServerSide } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function LoginPage() {
  const supabase = createClientServerSide({ cookies });

  const { data } = await (await supabase).auth.getSession();

  if (data.session?.user) {
    redirect("/");
  }

  return (
    <main className="max-w-full min-h-screen flex flex-col items-center justify-center">
      <LoginDataPage />
    </main>
  );
}
