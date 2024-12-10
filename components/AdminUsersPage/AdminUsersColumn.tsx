import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  handleUpdateRole,
  handleUpdateUserRestriction,
} from "@/services/User/Admin";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { UserRequestdata } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import TableLoading from "../ui/tableLoading";

export const AdminUsersColumn = (
  handleFetch: () => void
): ColumnDef<UserRequestdata>[] => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePromoteToMerchant = async (
    alliance_member_alliance_id: string
  ) => {
    try {
      setIsLoading(true);
      await handleUpdateRole({ userId: alliance_member_alliance_id });
      handleFetch();
      toast({
        title: `Role Updated`,
        description: `Role Updated Sucessfully`,
        variant: "success",
      });
    } catch (e) {
      toast({
        title: `Role Update Failed`,
        description: `Something went wrong`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (alliance_member_alliance_id: string) => {
    try {
      setIsLoading(true);
      await handleUpdateUserRestriction({
        userId: alliance_member_alliance_id,
      });
      handleFetch();
      toast({
        title: `User Banned`,
        description: `User Banned Sucessfully`,
        variant: "success",
      });
    } catch (e) {
      toast({
        title: `User Ban Failed`,
        description: `Something went wrong`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    <TableLoading />;
  }

  return [
    {
      accessorKey: "user_id",
      label: "User ID",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User ID <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const id = row.getValue("user_id") as string;
        const maxLength = 15;

        const handleCopy = async () => {
          if (id) {
            await navigator.clipboard.writeText(id);
            toast({
              title: "Copied",
              description: "User ID copied to clipboard",
              variant: "success",
            });
          }
        };

        return (
          <div className="flex items-center space-x-2">
            <div
              className="truncate"
              title={id.length > maxLength ? id : undefined}
            >
              {id.length > maxLength ? `${id.slice(0, maxLength)}...` : id}
            </div>
            {id && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "user_username",
      label: "Username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <Link
          className="cursor-pointer"
          href={`/admin/users/${row.getValue("user_id")}`}
        >
          <Button variant="link" className="text-wrap">
            {row.getValue("user_username")}
          </Button>
        </Link>
      ),
    },
    {
      accessorKey: "user_first_name",
      label: "First Name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("user_first_name")}</div>
      ),
    },
    {
      accessorKey: "user_last_name",
      label: "Last Name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("user_last_name")}</div>
      ),
    },
    {
      accessorKey: "alliance_member_role",
      label: "Role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("alliance_member_role")}
        </div>
      ),
    },
    {
      accessorKey: "user_date_created",
      label: "Date Created",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Created <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {formatDateToYYYYMMDD(row.getValue("user_date_created"))}
        </div>
      ),
    },
    {
      accessorKey: "alliance_member_restricted",
      label: "Restricted",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Restricted <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("alliance_member_restricted") ? "YES" : "NO"}
        </div>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handlePromoteToMerchant(data.alliance_member_id)}
              >
                Promote as Merchant
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBanUser(data.alliance_member_id)}
              >
                Ban User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
