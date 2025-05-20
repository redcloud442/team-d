import HistoryTable from "./HistoryTable";

const HistoryPage = ({
  type,
}: {
  type: "withdrawal" | "deposit" | "earnings";
}) => {
  return <HistoryTable type={type} />;
};

export default HistoryPage;
