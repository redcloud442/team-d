import AllyBountyTable from "./AllyBountyTable";

type Props = {
  type: "new-register" | "direct" | "unilevel";
};

const AllyBountyPage = ({ type }: Props) => {
  return (
    <div className="md:p-10">
      <div>
        {/* Header Section */}

        <section className=" rounded-lg ">
          <AllyBountyTable type={type} />
        </section>
      </div>
    </div>
  );
};

export default AllyBountyPage;
