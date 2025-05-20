import HistoryPage from "@/components/HistoryPage/HistoryPage";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ type: "withdrawal" | "deposit" | "earnings" }>;
}) => {
  const { type } = await params;
  const validTypes = ["withdrawal", "deposit", "earnings"];

  if (!validTypes.includes(type)) {
    return redirect("/digi-dash");
  }

  return <HistoryPage type={type} />;
};

export default page;
