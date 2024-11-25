import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { UserRequestdata } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, MoreHorizontal } from "lucide-react";

export const AdminUsersColumn = (): ColumnDef<UserRequestdata>[] => {
  const { toast } = useToast();

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
      accessorKey: "user_email",
      label: "Email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">{row.getValue("user_email")}</div>
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
        <div className="font-medium text-center">
          {row.getValue("user_first_name")}
        </div>
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
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;

        const handleApprove = () => {
          toast({
            title: "Approved",
            description: `Request for ${data.user_email} approved.`,
            variant: "success",
          });
        };

        const handleReject = () => {
          toast({
            title: "Rejected",
            description: `Request for ${data.user_email} rejected.`,
            variant: "destructive",
          });
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleApprove}>
                Approve
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReject}>Reject</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReject}>
                Promote as Merchant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
