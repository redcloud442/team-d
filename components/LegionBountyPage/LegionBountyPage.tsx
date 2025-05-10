import { Separator } from "../ui/separator";
import LegionBountyTable from "./LegionBountyTable";

const LegionBountyPage = () => {
  return (
    <div className="md:p-10">
      <div>
        {/* Header Section */}
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Matrix Page
          </h1>
          <p className="text-gray-600 dark:text-white">
            View all your Matrix connections.
          </p>
        </header>

        <Separator className="my-4" />

        {/* Table Section */}
        <section className="rounded-lg ">
          <LegionBountyTable />
        </section>
      </div>
    </div>
  );
};

export default LegionBountyPage;
