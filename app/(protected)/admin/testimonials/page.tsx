import AdminUploadUrlPage from "@/components/AdminUploadUrlPage/AdminUploadUrlPage";
import prisma from "@/utils/prisma";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "List of Testimonials",
  openGraph: {
    url: "/admin/testimonials",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await prisma.$transaction(async (tx) => {
    return await protectionAdminUser(tx);
  });

  if (!teamMemberProfile) return redirect("/auth/login");

  return <AdminUploadUrlPage />;
};

export default Page;
