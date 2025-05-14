import PackagePage from "@/components/PackagePage/PackagePage";
import prisma from "@/utils/prisma";

const page = async () => {
  const packages = await prisma.package_table.findMany({
    where: { package_is_disabled: false },
  });

  return <PackagePage packages={packages} />;
};

export default page;
