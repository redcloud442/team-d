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
      header: () => <Button variant="ghost">Rank</Button>,
      cell: ({ row }) => {
        const rank = row.index + 1 + pageIndex * pageSize;

        switch (rank) {
          case 1:
            return (
              <Badge className="bg-green-500 dark:bg-green-600 text-white">
                Top 1
              </Badge>
            );
          case 2:
            return (
              <Badge className="bg-green-500 dark:bg-green-600 text-white">
                Top 2
              </Badge>
            );
          case 3:
            return (
              <Badge className="bg-green-500 dark:bg-green-600 text-white">
                Top 3
              </Badge>
            );
          default:
            return <Badge className="bg-gray-500">Top {rank}</Badge>;
        }
      },
    },
    {
      accessorKey: "username",

      header: () => <Button variant="ghost">Username</Button>,
      cell: ({ row }) => {
        const username = row.getValue("username") as string;
        return <div className="font-medium ">{username}</div>;
      },
    },
    {
      accessorKey: "totalAmount",

      header: () => <Button variant="ghost">Amount</Button>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount"));
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
        return <div>{formatted}</div>;
      },
    },
  ];
};
