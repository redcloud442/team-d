// app/dashboard/page.tsx

import DashboardPage from "@/components/DashboardPage/DashboardPage";
import { createClientServerSide } from "@/utils/supabase/server";

const Page = async () => {
  const supabase = await createClientServerSide();

  const { data: user } = await supabase.auth.getSession();

  const accessToken = user?.session?.access_token;

  return <DashboardPage accessToken={accessToken ?? ""} />;
};

export default Page;
