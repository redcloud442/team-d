import { Separator } from "../ui/separator";
import AdminUserMonitoringTable from "./AdminUserMonitoringTable";

const AdminUserMonitoringPage = () => {
  return (
    <div className="mx-auto md:p-10 space-y-6">
      <div>
        {/* Page Title */}
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Users With Wallet Balance Page
          </h1>
          <p className="text-gray-600 dark:text-white">
            View all your user with wallet balance that are currently in the
            system
          </p>
        </header>

        <Separator className="my-4" />

        {/* Table Section */}
        <section className=" rounded-lg ">
          <AdminUserMonitoringTable />
        </section>
      </div>
    </div>
  );
};

export default AdminUserMonitoringPage;
