import AvailPackagePage from "@/components/AvailPackagePage/AvailPackagePage";
import { Loader2 } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ transaction_id?: string }>;
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const PackageContent = async ({ packageId }: { packageId: string }) => {
  await delay(2000);

  const specificPackage = await fetch(
    `${process.env.API_URL}/api/v1/package/${packageId}`,
    {
      method: "GET",
      headers: {
        cookie: (await cookies()).toString(),
      },
    }
  );

  const { data } = await specificPackage.json();

  if (!data) {
    redirect("/subscription");
  }

  return <AvailPackagePage selectedPackage={data} />;
};

const Page = async ({ searchParams }: Props) => {
  const transactionId = (await searchParams).transaction_id;

  const uuidMatch = transactionId?.match(
    /TR-([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/
  );

  const packageId = uuidMatch?.[1];

  if (!packageId) {
    redirect("/subscription");
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <p className="text-2xl font-bold">Creating your transaction...</p>
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      }
    >
      <PackageContent packageId={packageId} />
    </Suspense>
  );
};

export default Page;
