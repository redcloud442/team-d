import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";

export const leaderBoardColumn = (
  pageIndex: number,
  pageSize: number
): ColumnDef<{
  username: string;
  totalAmount: number;
}>[] => {
  return [
    {
      id: "Rank",
      header: () => (
        <Button className="w-fit" variant="ghost">
          Rank
        </Button>
      ),
      cell: ({ row }) => {
        const rank = row.index + 1 + (pageIndex - 1) * pageSize;

        return (
          <div className="flex justify-center items-center">
            {" "}
            {/* Flex container for centering */}
            {rank === 1 ? (
              <Badge className="bg-green-500 dark:bg-green-600 text-white dark:text-white">
                Top 1
              </Badge>
            ) : rank === 2 ? (
              <Badge className="bg-green-500 dark:bg-green-600 text-white dark:text-white">
                Top 2
              </Badge>
            ) : rank === 3 ? (
              <Badge className="bg-green-500 dark:bg-green-600 text-white dark:text-white">
                Top 3
              </Badge>
            ) : (
              <Badge className="bg-gray-500">Rank {rank}</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "username",

      header: () => (
        <Button className="w-full " variant="ghost">
          Username
        </Button>
      ),
      cell: ({ row }) => {
        const username = row.getValue("username") as string;
        return <div className="font-medium text-center">{username}</div>;
      },
    },
    {
      accessorKey: "totalAmount",

      header: () => (
        <Button className="w-full " variant="ghost">
          Amount
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount"));
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
        return <div className="text-center">{formatted}</div>;
      },
    },
    {
      accessorKey: "totalReferral",
      header: () => (
        <Button className="w-full " variant="ghost">
          Referral Count
        </Button>
      ),
      cell: ({ row }) => {
        const count = row.getValue("totalReferral");
        return <div className="text-center">{Number(count)}</div>;
      },
    },
  ];
};
