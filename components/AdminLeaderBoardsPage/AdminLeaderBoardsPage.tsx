import { Separator } from "../ui/separator";
import AdminLeaderBoardsPage from "./AdminLeaderBoardsTable";

const AdminUserPage = () => {
  return (
    <div className=" md:p-10">
      <div>
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Top Users Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-white">
            View all your user that are currently in the system
          </p>
        </header>

        <Separator className="my-4" />

        {/* Table Section */}
        <section className=" rounded-lg  ">
          <AdminLeaderBoardsPage />
        </section>
      </div>
    </div>
  );
};

export default AdminUserPage;
