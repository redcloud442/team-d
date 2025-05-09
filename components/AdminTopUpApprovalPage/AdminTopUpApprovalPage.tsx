import { Separator } from "../ui/separator";
import AdminTopUpApprovalTable from "./AdminTopUpApprovalTable";

const AdminTopUpApprovalPage = () => {
  return (
    <div className="mx-auto md:p-10">
      <div>
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Deposit History List Page
          </h1>
          <p className="text-gray-600 dark:text-white">
            View all your transactions that are currently in the system.
          </p>
        </header>

        <Separator className="my-4" />

        {/* Table Section */}
        <section className=" rounded-lg space-y-4">
          <AdminTopUpApprovalTable />
        </section>
      </div>
    </div>
  );
};

export default AdminTopUpApprovalPage;
