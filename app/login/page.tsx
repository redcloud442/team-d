
import LoginDataPage from "@/components/loginPage/loginPage";
import { createClientServerSide } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function LoginPage() {
  const supabase = createClientServerSide({cookies})
  const { data } = await (await supabase).auth.getSession()
  if (data.session?.user) {
    redirect("/");
  }

  return (
    <main className="max-w-lg min-h-screen bg-red-600">
      <h1 className="text-2xl text-center mb-6">Login</h1>
      <LoginDataPage />
    </main>
  );
}
