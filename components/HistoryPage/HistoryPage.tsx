import HistoryTable from "./HistoryTable";

const HistoryPage = ({
  type,
}: {
  type: "withdrawal" | "deposit" | "earnings" | "referral";
}) => {
  return (
    <>
      <header className="mb-4">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          {type.charAt(0).toUpperCase() + type.slice(1)} Transactions
        </h1>
      </header>
      <HistoryTable type={type} />
    </>
  );
};

export default HistoryPage;
