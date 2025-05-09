import { Separator } from "../ui/separator";
import AdminExportContent from "./AdminExportContent";

const AdminExportPage = () => {
  return (
    <div className="mx-auto md:p-10">
      <div>
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Export Page
          </h1>
          <p className="text-gray-600 dark:text-white">
            Export your data from the system.
          </p>
        </header>

        <Separator className="my-4" />

        {/* Table Section */}
        <section className=" rounded-lg ">
          <AdminExportContent />
        </section>
      </div>
    </div>
  );
};

export default AdminExportPage;
