import AllyBountyTable from "./AllyBountyTable";

const AllyBountyPage = () => {
  return (
    <div className="md:p-10">
      <div>
        {/* Header Section */}

        <section className=" rounded-lg ">
          <AllyBountyTable />
        </section>
      </div>
    </div>
  );
};

export default AllyBountyPage;
