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
        </header>

        <section className=" rounded-lg ">
          <AllyBountyTable />
        </section>
      </div>
    </div>
  );
};

export default AllyBountyPage;
