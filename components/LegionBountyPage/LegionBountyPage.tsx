import LegionBountyTable from "./LegionBountyTable";

const LegionBountyPage = () => {
  return (
    <div className="md:p-10">
      <div>
        {/* Header Section */}
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Unilevel
          </h1>
        </header>

        {/* Table Section */}
        <section className="rounded-lg ">
          <LegionBountyTable />
        </section>
      </div>
    </div>
  );
};

export default LegionBountyPage;
