import AllyBountyPage from "@/components/AllyBountyPage/AllyBountyPage";
import { notFound } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ type: "new-register" | "direct" | "unilevel" }>;
}) => {
  const { type } = await params;

  if (!["new-register", "direct", "unilevel"].includes(type)) {
    return notFound();
  }

  return <AllyBountyPage type={type} />;
};

export default page;
