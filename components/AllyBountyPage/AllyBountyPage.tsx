"use client";
import { Separator } from "../ui/separator";
import AllyBountyTable from "./AllyBountyTable";

const AllyBountyPage = () => {
  return (
    <div className="md:p-10">
      <div>
        {/* Header Section */}
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Referral Page
          </h1>
          <p className="text-gray-600 dark:text-white">
            View all your Referral Connections that are currently in the system.
          </p>
        </header>

        <Separator className="my-4" />
        <section className=" rounded-lg ">
          <AllyBountyTable />
        </section>
      </div>
    </div>
  );
};

export default AllyBountyPage;
